import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const COMBO_LABELS = ['', '', '2×', '3×', '4×', '5× MAX!'];
const COMBO_COLORS = ['', '', '#00ffcc', '#9f50ff', '#ff8c00', '#ff2d78'];

export default function ComboDisplay() {
  const combo    = useGameStore((s) => s.combo);
  const [animKey, setAnimKey] = useState(0);
  const prevCombo = useRef(combo);

  useEffect(() => {
    if (combo !== prevCombo.current) {
      setAnimKey((k) => k + 1);
      prevCombo.current = combo;
    }
  }, [combo]);

  if (combo < 2) return null;

  const color = COMBO_COLORS[Math.min(combo, 5)];
  const label = COMBO_LABELS[Math.min(combo, 5)];
  const isMax = combo >= 5;

  return (
    <div className="absolute flex flex-col items-center" style={{ top: '70px', left: 0, right: 0 }}>
      <div
        key={animKey}
        className="combo-pop inline-flex flex-col items-center px-5 py-2 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}66`,
          boxShadow: `0 0 20px ${color}44`,
        }}
      >
        <span
          className="text-3xl font-black"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color,
            textShadow: `0 0 12px ${color}, 0 0 30px ${color}`,
            animation: isMax ? 'comboShake 0.3s ease-in-out infinite' : undefined,
          }}
        >
          {label}
        </span>
        <span className="text-xs tracking-widest uppercase" style={{ color: `${color}99` }}>
          COMBO
        </span>
      </div>
    </div>
  );
}
