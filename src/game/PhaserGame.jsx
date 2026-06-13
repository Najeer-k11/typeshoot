import { useEffect, useRef } from 'react';
import { createPhaserGame } from './main';

export default function PhaserGame() {
  const gameRef = useRef(null);

  useEffect(() => {
    // Guard against React strict mode double-invoke and hot reload
    if (gameRef.current) return;

    gameRef.current = createPhaserGame('phaser-container');

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="phaser-container"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
