import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function GameOverScreen() {
  const score      = useGameStore((s) => s.score);
  const wave       = useGameStore((s) => s.wave);
  const highScore  = useGameStore((s) => s.highScore);
  const resetGame  = useGameStore((s) => s.resetGame);
  const setScreen  = useGameStore((s) => s.setScreen);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    // Check if we just set a new high score
    const stored = parseInt(localStorage.getItem('highScore') || '0');
    setIsNew(score >= stored && score > 0);
  }, [score]);

  function handleReplay() {
    resetGame();
    setScreen('game');
  }

  function handleMenu() {
    resetGame();
    setScreen('menu');
  }

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center gap-8 screen-enter"
      style={{ height: '100dvh' }}
    >
      {/* Red ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,45,120,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Game Over heading */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <h1
          className="text-5xl font-black tracking-widest uppercase glow-pink"
          style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff2d78' }}
        >
          GAME OVER
        </h1>
        <p className="text-sm tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Wave {wave} reached
        </p>
      </div>

      {/* Score card */}
      <div className="relative z-10 glass-card px-10 py-6 flex flex-col items-center gap-4 w-72">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Final Score
          </span>
          <span
            className="text-4xl font-black glow-cyan"
            style={{ color: '#00ffcc', fontFamily: 'Orbitron, sans-serif' }}
          >
            {score.toLocaleString()}
          </span>
        </div>

        {isNew && score > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255,230,102,0.2), rgba(255,140,0,0.2))',
              border: '1px solid rgba(255,230,102,0.4)',
            }}
          >
            <span>🏆</span>
            <span className="text-sm font-bold tracking-widest uppercase glow-yellow" style={{ color: '#ffe666' }}>
              New High Score!
            </span>
          </div>
        )}

        <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Best Score
          </span>
          <span className="text-xl font-bold" style={{ color: '#ffe666', fontFamily: 'Orbitron, sans-serif' }}>
            {highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 flex flex-col gap-4 w-64">
        <button
          id="replay-btn"
          onClick={handleReplay}
          className="btn-press w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-base transition-all duration-200"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: 'linear-gradient(135deg, #00ffcc, #00cc9a)',
            color: '#0a0a1a',
            boxShadow: '0 0 24px rgba(0,255,204,0.4)',
          }}
        >
          PLAY AGAIN
        </button>

        <button
          id="menu-btn"
          onClick={handleMenu}
          className="btn-press w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-base transition-all duration-200 glass-card"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
