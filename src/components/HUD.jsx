import { useGameStore } from '../store/gameStore';

export default function HUD() {
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const wave  = useGameStore((s) => s.wave);

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-20"
      style={{ background: 'linear-gradient(to bottom, rgba(10,10,26,0.9) 0%, transparent 100%)' }}
    >
      {/* Wave indicator */}
      <div className="flex flex-col items-start">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Wave
        </span>
        <span
          className="text-xl font-black glow-purple"
          style={{ color: '#9f50ff', fontFamily: 'Orbitron, sans-serif', lineHeight: 1 }}
        >
          {wave}
        </span>
      </div>

      {/* Lives */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={i < lives ? 'heart-pulse' : ''}
            style={{
              fontSize: '20px',
              filter: i < lives
                ? 'drop-shadow(0 0 6px rgba(255,45,120,0.8))'
                : 'grayscale(1) opacity(0.25)',
            }}
          >
            ❤
          </span>
        ))}
      </div>

      {/* Score */}
      <div className="flex flex-col items-end">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Score
        </span>
        <span
          className="text-xl font-black glow-cyan"
          style={{ color: '#00ffcc', fontFamily: 'Orbitron, sans-serif', lineHeight: 1 }}
        >
          {score.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
