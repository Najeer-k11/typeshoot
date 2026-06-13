import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export function createPhaserGame(containerId) {
  const config = {
    type: Phaser.AUTO,
    parent: containerId,
    backgroundColor: '#0a0a1a',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerId,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false },
    },
    scene: [BootScene, GameScene],
    // Disable Phaser's default keyboard capture so React gets all key events
    input: {
      keyboard: false,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  };

  return new Phaser.Game(config);
}
