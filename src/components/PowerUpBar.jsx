import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const POWERUP_META = {
  freeze:  { icon: '❄️', label: 'FREEZE',       color: '#7ec8f5', duration: 4000  },
  nuke:    { icon: '💥', label: 'NUKE',          color: '#ff8c00', duration: 800   },
  x2:      { icon: '✦',  label: 'DOUBLE PTS',   color: '#ffe666', duration: 10000 },
  shield:  { icon: '🛡️', label: 'SHIELD',        color: '#9f50ff', duration: null  },
  slow:    { icon: '🐢', label: 'SLOW-MO',       color: '#b46ef5', duration: 6000  },
};

export default function PowerUpBar() {
  const activePowerUp = useGameStore((s) => s.activePowerUp);
  const [progress, setProgress] = useState(1);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!activePowerUp) {
      setProgress(1);
      return;
    }
    const meta = POWERUP_META[activePowerUp.type];
    if (!meta.duration) {
      setProgress(1); // shield — no drain
      return;
    }

    const startTime = activePowerUp.startedAt || Date.now();
    const endTime   = startTime + meta.duration;

    const tick = () => {
      const now  = Date.now();
      const left = Math.max(0, endTime - now);
      setProgress(left / meta.duration);
      if (left > 0) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activePowerUp]);

  if (!activePowerUp) return null;

  const meta  = POWERUP_META[activePowerUp.type];
  const color = meta?.color || '#00ffcc';
  const isShield = activePowerUp.type === 'shield';

  return (
    <div
      className="absolute left-4 right-4 flex flex-col gap-1"
      style={{ bottom: '80px' }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}44`,
        }}
      >
        <span style={{ fontSize: '18px' }}>{meta.icon}</span>
        <span className="text-xs font-bold tracking-widest uppercase flex-1" style={{ color }}>
          {meta.label}
        </span>
        {isShield ? (
          <span className="text-xs" style={{ color: `${color}99` }}>ACTIVE</span>
        ) : (
          <span className="text-xs" style={{ color: `${color}99` }}>
            {((activePowerUp.expiresAt - Date.now()) / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {/* Timer bar */}
      {!isShield && (
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: `${color}22` }}
        >
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </div>
      )}
    </div>
  );
}
