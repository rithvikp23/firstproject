import React, { useState } from 'react';
import './App.css';
import DinoGame from './DinoGame';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="App">
      {!open && (
        <div className="center-screen">
          <h1 className="game-title">my first game</h1>
          <button onClick={() => setOpen(true)}>click here to play</button>
        </div>
      )}

      <DinoGame visible={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default App;
