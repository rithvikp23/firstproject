import React, { useRef, useEffect } from 'react';

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function ParticleBackground({ particleCount = 80, color = '#61dafb', speed = 1, interactive = true }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null, down: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(DPR, DPR);

    let particles = [];

    function createParticles(n) {
      particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-0.6, 0.6) * speed,
          vy: rand(-0.6, 0.6) * speed,
          // larger base size so particles are more apparent
          r: rand(2, 5),
          life: rand(60, 240),
        });
      }
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const DPR = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(DPR, DPR);
      createParticles(particleCount);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

  // darker background gradient for stronger particle contrast
  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0, 'rgba(6,10,20,0.85)');
  g.addColorStop(1, 'rgba(4,8,14,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            // stronger, slightly thicker connection lines
            ctx.strokeStyle = color + 'bb';
            ctx.lineWidth = Math.max(0.4, (1 - dist / 140) * 1.6);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // particle movement and render
      particles.forEach((p) => {
        // attraction to mouse
        if (interactive && mouse.current.x !== null) {
          const dx = mouse.current.x - p.x;
          const dy = mouse.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = mouse.current.down ? 2000 : 800;
          const f = (force / dist) * 0.0005;
          p.vx += dx * f;
          p.vy += dy * f;
        }

        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // simple bounds
        if (p.x < -10) p.x = width + 10;
        if (p.y < -10) p.y = height + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y > height + 10) p.y = -10;

        // draw with glow and additive blending to make particles pop
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        // soft glow using shadow + radial gradient
        ctx.shadowBlur = Math.max(8, p.r * 6);
        ctx.shadowColor = color;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        // make center bright and slightly opaque
        grad.addColorStop(0, color + 'ff');
        grad.addColorStop(0.4, color + 'cc');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    let raf = null;
    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    }

    function onDown(e) {
      mouse.current.down = true;
      // burst: spawn new fast particles near click
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: mouse.current.x + rand(-8, 8),
          y: mouse.current.y + rand(-8, 8),
          vx: rand(-4, 4),
          vy: rand(-4, 4),
          r: rand(1, 3),
          life: 60,
        });
      }
      setTimeout(() => (mouse.current.down = false), 120);
    }

    function onLeave() {
      mouse.current.x = null;
      mouse.current.y = null;
    }

    window.addEventListener('resize', resize);
    if (interactive) {
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mousedown', onDown);
      canvas.addEventListener('mouseleave', onLeave);
    }

    createParticles(particleCount);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mouseleave', onLeave);
    };
    // intentionally not adding particleCount/speed/color to deps to allow live prop-driven updates
  }, [interactive, particleCount, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: -1, display: 'block' }}
      aria-hidden
    />
  );
}

export default ParticleBackground;
