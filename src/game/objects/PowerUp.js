import Phaser from 'phaser';

const POWERUP_COLORS = {
  freeze: 0x7ec8f5,
  nuke:   0xff8c00,
  x2:     0xffe666,
  shield: 0x9f50ff,
  slow:   0xb46ef5,
};

const POWERUP_ICONS = {
  freeze: '❄',
  nuke:   '💥',
  x2:     '✦',
  shield: '🛡',
  slow:   '🐢',
};

export class PowerUp {
  /**
   * @param {Phaser.Scene} scene
   * @param {object}       config  { type, x, y }
   */
  constructor(scene, { type, x, y }) {
    this.scene  = scene;
    this.type   = type;
    this.word   = type;  // the activation word IS the type string
    this.alive  = true;

    const color = POWERUP_COLORS[type] || 0x00ffcc;
    const icon  = POWERUP_ICONS[type]  || '?';

    // ── Container ────────────────────────────────────────────────
    this.container = scene.add.container(x, y);

    // ── Glow background ──────────────────────────────────────────
    const glow = scene.add.graphics();
    glow.fillStyle(color, 0.2);
    glow.fillCircle(0, 0, 28);
    glow.lineStyle(2, color, 0.8);
    glow.strokeCircle(0, 0, 28);
    this.container.add(glow);

    // ── Label ────────────────────────────────────────────────────
    this.label = scene.add.text(0, -40, type.toUpperCase(), {
      fontFamily: 'Orbitron, monospace',
      fontSize:   '11px',
      color:      `#${color.toString(16).padStart(6, '0')}`,
      stroke:     '#000000',
      strokeThickness: 3,
      align:      'center',
    }).setOrigin(0.5, 1);
    this.container.add(this.label);

    // ── Icon text ────────────────────────────────────────────────
    const iconText = scene.add.text(0, 0, icon, {
      fontSize: '20px',
      align:    'center',
    }).setOrigin(0.5, 0.5);
    this.container.add(iconText);

    // ── Float + pulse tween ───────────────────────────────────────
    scene.tweens.add({
      targets:  this.container,
      y:        y + 8,
      duration: 1000,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    scene.tweens.add({
      targets:  glow,
      alpha:    { from: 0.6, to: 1 },
      duration: 600,
      yoyo:     true,
      repeat:   -1,
    });

    // ── Auto-despawn after 8 seconds ─────────────────────────────
    scene.time.delayedCall(8000, () => this.destroy());
  }

  update(delta) {
    if (!this.alive) return;
    this.container.y += 40 * (delta / 1000); // slow fall
  }

  isAtBottom(h = 854) {
    return this.container.y > h + 40;
  }

  destroy() {
    this.alive = false;
    this.scene.tweens.add({
      targets:  this.container,
      alpha:    0,
      scaleX:   0.5,
      scaleY:   0.5,
      duration: 200,
      onComplete: () => this.container.destroy(true),
    });
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }
}
