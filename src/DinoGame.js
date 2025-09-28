import React, { useRef, useEffect, useState } from 'react';

function DinoGame({ visible = false, onClose = null, accentColor = '#0077ffff' }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width = 800;
    let height = 200;
    let raf = null;

    // game state (sizes will be set in resize())
    const dino = { x: 0, y: 0, w: 0, h: 0, vy: 0, grounded: true };
    const gravity = 0.9;
    const jumpPower = -14;
    let obstacles = [];
    let speed = 6;
    let frame = 0;
    let running = true;

    function resize() {
      // choose width based on viewport but leave some padding
      const maxWidth = Math.min(window.innerWidth - 40, 980);
      width = Math.max(320, maxWidth);
      // maintain approx 4:1 width:height ratio (like original 800x200)
      height = Math.max(140, Math.round(width * 0.25));

      // size canvas backing store for crisp rendering
      const DPR = Math.max(1, window.devicePixelRatio || 1);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = Math.round(width * DPR);
      canvas.height = Math.round(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // set dino size relative to width
      dino.w = Math.round(Math.max(28, width * 0.06));
      dino.h = dino.w;
      dino.x = Math.round(width * 0.06);
      dino.y = height - dino.h - 10;
    }

    function spawnObstacle() {
      const w = Math.round(Math.max(12, width * (0.02 + Math.random() * 0.03)));
      obstacles.push({ x: width + 10, y: height - w - 10, w: w, h: w, passed: false });
    }

    function reset() {
      obstacles = [];
      speed = 6;
      frame = 0;
      setScore(0);
      dino.y = height - 40;
      dino.vy = 0;
      dino.grounded = true;
      running = true;
    }

    function update() {
      // physics
      dino.vy += gravity;
      dino.y += dino.vy;
      if (dino.y >= height - dino.h - 10) {
        dino.y = height - dino.h - 10;
        dino.vy = 0;
        dino.grounded = true;
      } else dino.grounded = false;

      // move obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed;
        if (!o.passed && o.x + o.w < dino.x) {
          o.passed = true;
          setScore((s) => s + 1);
          speed += 0.08; // slight speedup
        }
        // collision
        if (
          dino.x < o.x + o.w &&
          dino.x + dino.w > o.x &&
          dino.y < o.y + o.h &&
          dino.y + dino.h > o.y
        ) {
          running = false;
        }
        if (o.x + o.w < -50) obstacles.splice(i, 1);
      }

      // spawn
      if (frame % Math.max(60, 120 - Math.floor(score / 5)) === 0) spawnObstacle();
      frame++;
    }

    function draw() {
      // clear
      ctx.fillStyle = '#f7f7f7';
      ctx.fillRect(0, 0, width, height);

      // ground
      ctx.fillStyle = '#555';
      ctx.fillRect(0, height - 10, width, 10);

      // dino
      ctx.fillStyle = '#222';
      ctx.fillRect(dino.x, dino.y, dino.w, dino.h);

      // obstacles
      ctx.fillStyle = '#0b6623';
      obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.w, o.h));

      // score (responsive font)
      ctx.fillStyle = '#222';
      const fontSize = Math.max(12, Math.round(width * 0.02));
      ctx.font = `${fontSize}px monospace`;
      ctx.fillText('Score: ' + score, width - Math.max(100, Math.round(width * 0.15)), Math.round(30 * (height / 200)));
    }

    function loop() {
      if (running) {
        update();
      }
      draw();
      raf = requestAnimationFrame(loop);
    }

  // initial sizing
  resize();
  loop();

    function onKey(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (running && dino.grounded) dino.vy = jumpPower;
        else if (!running) reset();
      }
      if (e.code === 'Escape') {
        if (onClose) onClose();
      }
    }

    function onClick() {
      if (running && dino.grounded) dino.vy = jumpPower;
      else if (!running) reset();
    }

  window.addEventListener('keydown', onKey);
  canvas.addEventListener('mousedown', onClick);
  window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('mousedown', onClick);
      window.removeEventListener('resize', resize);
    };
  }, [visible, score, onClose]);

  if (!visible) return null;

  return (
    <div className="dino-overlay">
      <div style={{ background: 'white', padding: 16, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <h2 style={{ margin: '0 0 8px', color: accentColor, textTransform: 'capitalize' }}>my first game</h2>
        <canvas ref={canvasRef} width={800} height={200} style={{ display: 'block' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => { if (onClose) onClose(); }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default DinoGame;
