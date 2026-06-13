import { useGameStore } from '../store/gameStore';

export default function MenuScreen() {
  const highScore = useGameStore((s) => s.highScore);
  const setScreen = useGameStore((s) => s.setScreen);

  async function handleStart() {
    // Portrait lock on mobile — silently ignored on desktop
    if (screen.orientation?.lock) {
      await screen.orientation.lock('portrait-primary').catch(() => {});
    }
    setScreen('game');
  }

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center gap-8 screen-enter scanlines"
      style={{ height: '100dvh' }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,204,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(159,80,255,0.2) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Logo / Title */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 mb-1">
          {/* Crosshair icon */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="10" stroke="#00ffcc" strokeWidth="2" />
            <circle cx="24" cy="24" r="3" fill="#00ffcc" />
            <line x1="24" y1="2" x2="24" y2="14" stroke="#00ffcc" strokeWidth="2" />
            <line x1="24" y1="34" x2="24" y2="46" stroke="#00ffcc" strokeWidth="2" />
            <line x1="2" y1="24" x2="14" y2="24" stroke="#00ffcc" strokeWidth="2" />
            <line x1="34" y1="24" x2="46" y2="24" stroke="#00ffcc" strokeWidth="2" />
          </svg>
        </div>

        <h1
          className="title-shimmer text-5xl font-black tracking-widest uppercase"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          Typing
        </h1>
        <h1
          className="title-shimmer text-5xl font-black tracking-widest uppercase"
          style={{ fontFamily: 'Orbitron, sans-serif', marginTop: '-8px' }}
        >
          Shooter
        </h1>
        <p className="text-sm tracking-[0.3em] uppercase" style={{ color: 'rgba(0,255,204,0.6)' }}>
          Type fast. Kill faster.
        </p>
      </div>

      {/* High score */}
      {highScore > 0 && (
        <div className="relative z-10 glass-card px-8 py-3 flex flex-col items-center gap-1">
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Best Score
          </span>
          <span className="text-2xl font-bold glow-yellow" style={{ color: '#ffe666', fontFamily: 'Orbitron, sans-serif' }}>
            {highScore.toLocaleString()}
          </span>
        </div>
      )}

      {/* Start button */}
      <button
        id="start-btn"
        onClick={handleStart}
        className="relative z-10 btn-press group px-12 py-4 rounded-2xl font-bold tracking-widest uppercase text-lg transition-all duration-200"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          background: 'linear-gradient(135deg, #00ffcc, #00cc9a)',
          color: '#0a0a1a',
          boxShadow: '0 0 24px rgba(0,255,204,0.5), 0 4px 20px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,204,0.8), 0 4px 20px rgba(0,0,0,0.4)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,204,0.5), 0 4px 20px rgba(0,0,0,0.4)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        START GAME
      </button>

      {/* Enemy type legend */}
      <div className="relative z-10 glass-card px-6 py-4 w-72">
        <p className="text-xs tracking-widest uppercase text-center mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Enemy Types
        </p>
        <div className="flex flex-col gap-2 text-sm">
          {[
            { color: '#7ec8f5', label: 'Grunt', desc: 'Easy words' },
            { color: '#f5c842', label: 'Runner', desc: 'Fast mover' },
            { color: '#ff6b35', label: 'Tank', desc: 'Heavy hitter' },
            { color: '#b46ef5', label: 'Splitter', desc: 'Splits on death' },
            { color: '#ff2d78', label: 'Boss', desc: 'Every 5 waves' },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="font-semibold" style={{ color }}>{label}</span>
              <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Type the word above each enemy to destroy it
      </p>
    </div>
  );
}
