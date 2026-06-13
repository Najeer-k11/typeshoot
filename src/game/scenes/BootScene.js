import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // No external assets — everything is drawn programmatically
    // Preload Google Font within canvas context if needed
  }

  create() {
    // Short boot delay then launch game
    this.time.delayedCall(50, () => {
      this.scene.start('GameScene');
    });
  }
}
