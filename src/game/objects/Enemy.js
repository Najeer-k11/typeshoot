import Phaser from 'phaser';

/** Visual config per enemy type */
const TYPE_CONFIG = {
  grunt: {
    color:       0x7ec8f5,
    glowColor:   '#7ec8f5',
    bodyW:       38,
    bodyH:       38,
    speed:       55,
    points:      100,
    labelOffset: -34,
    shape:       'diamond',
  },
  runner: {
    color:       0xf5c842,
    glowColor:   '#f5c842',
    bodyW:       32,
    bodyH:       32,
    speed:       120,
    points:      150,
    labelOffset: -28,
    shape:       'triangle',
  },
  tank: {
    color:       0xff6b35,
    glowColor:   '#ff6b35',
    bodyW:       54,
    bodyH:       54,
    speed:       30,
    points:      300,
    labelOffset: -42,
    shape:       'hexagon',
  },
  splitter: {
    color:       0xb46ef5,
    glowColor:   '#b46ef5',
    bodyW:       42,
    bodyH:       42,
    speed:       70,
    points:      200,
    labelOffset: -36,
    shape:       'circle',
  },
  boss: {
    color:       0xff2d78,
    glowColor:   '#ff2d78',
    bodyW:       80,
    bodyH:       80,
    speed:       22,
    points:      1000,
    labelOffset: -56,
    shape:       'boss',
  },
};

export class Enemy {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} config  { type, word, x, y }
   */
  constructor(scene, { type, word, x, y }) {
    this.scene    = scene;
    this.type     = type;
    this.word     = word;
    this.typed    = '';       // progress so far
    this.alive    = true;
    this.isFrozen = false;
    this.speedMod = 1;        // affected by slow-mo

    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.grunt;
    this.cfg  = cfg;
    this.baseSpeed = cfg.speed;

    // ── Container ────────────────────────────────────────────────
    this.container = scene.add.container(x, y);

    // ── Body graphic ─────────────────────────────────────────────
    this.body = scene.add.graphics();
    this._drawBody(cfg);
    this.container.add(this.body);

    // ── Word label (full word, dim) ───────────────────────────────
    this.wordText = scene.add.text(0, cfg.labelOffset, word, {
      fontFamily: 'Orbitron, monospace',
      fontSize:   type === 'boss' ? '16px' : '13px',
      color:      '#ffffff',
      alpha:      0.7,
      stroke:     '#000000',
      strokeThickness: 3,
      align:      'center',
    }).setOrigin(0.5, 1);
    this.container.add(this.wordText);

    // ── Typed progress (bright, on top) ──────────────────────────
    this.typedText = scene.add.text(0, cfg.labelOffset, '', {
      fontFamily: 'Orbitron, monospace',
      fontSize:   type === 'boss' ? '16px' : '13px',
      color:      cfg.glowColor,
      stroke:     '#000000',
      strokeThickness: 3,
      align:      'center',
    }).setOrigin(0.5, 1);
    this.typedText.setX(this._typedOffsetX());
    this.container.add(this.typedText);

    // ── Health bar (boss only) ────────────────────────────────────
    if (type === 'boss') {
      this.hpBar = scene.add.graphics();
      this._drawHpBar(1);
      this.container.add(this.hpBar);
    }

    // ── Pulse tween ──────────────────────────────────────────────
    scene.tweens.add({
      targets:  this.body,
      alpha:    { from: 0.85, to: 1 },
      duration: type === 'boss' ? 600 : 900,
      yoyo:     true,
      repeat:   -1,
    });
  }

  // ── Drawing helpers ───────────────────────────────────────────────

  _drawBody(cfg) {
    const g = this.body;
    g.clear();

    const w2 = cfg.bodyW / 2;
    const h2 = cfg.bodyH / 2;

    // Outer glow ring
    g.fillStyle(cfg.color, 0.15);
    g.fillCircle(0, 0, Math.max(w2, h2) + 8);

    g.lineStyle(2, cfg.color, 1);
    g.fillStyle(cfg.color, 0.9);

    switch (cfg.shape) {
      case 'diamond':
        g.fillPoints([
          { x: 0,   y: -h2 },
          { x: w2,  y: 0   },
          { x: 0,   y: h2  },
          { x: -w2, y: 0   },
        ], true);
        g.strokePoints([
          { x: 0,   y: -h2 },
          { x: w2,  y: 0   },
          { x: 0,   y: h2  },
          { x: -w2, y: 0   },
        ], true);
        break;

      case 'triangle':
        g.fillTriangle(0, -h2, w2, h2, -w2, h2);
        g.strokeTriangle(0, -h2, w2, h2, -w2, h2);
        break;

      case 'hexagon': {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return { x: Math.cos(a) * w2, y: Math.sin(a) * h2 };
        });
        g.fillPoints(pts, true);
        g.strokePoints(pts, true);
        break;
      }

      case 'circle':
        g.fillCircle(0, 0, w2);
        g.strokeCircle(0, 0, w2);
        break;

      case 'boss': {
        // Star / octagon shape for boss
        const outerR = w2;
        const innerR = w2 * 0.55;
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const a     = (Math.PI / 4) * i - Math.PI / 8;
          const r     = i % 2 === 0 ? outerR : innerR;
          pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
        g.fillPoints(pts, true);
        g.strokePoints(pts, true);

        // Inner circle
        g.fillStyle(0xff0044, 0.6);
        g.fillCircle(0, 0, innerR * 0.7);
        break;
      }
    }

    // Inner highlight dot
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(-w2 * 0.3, -h2 * 0.3, 4);
  }

  _drawHpBar(ratio) {
    const g  = this.hpBar;
    const hw = 60;
    const hy = 50;
    g.clear();
    g.fillStyle(0x000000, 0.5);
    g.fillRect(-hw, hy, hw * 2, 6);
    g.fillStyle(0xff2d78, 1);
    g.fillRect(-hw, hy, hw * 2 * ratio, 6);
  }

  _typedOffsetX() {
    if (!this.typed || !this.wordText) return -this.wordText.width / 2;
    // Position typed text to start where wordText starts
    return -this.wordText.width / 2;
  }

  // ── Public API ────────────────────────────────────────────────────

  /** Feed the next expected character. Returns true if the word is complete. */
  typeChar(ch) {
    const expected = this.word[this.typed.length];
    if (!expected || ch !== expected) return false;

    this.typed += ch;
    this._updateLabel();

    return this.typed === this.word;
  }

  /** Reset typed progress (e.g. when lock-on switches to another enemy) */
  resetTyped() {
    this.typed = '';
    this._updateLabel();
  }

  _updateLabel() {
    const typed    = this.typed;
    const remaining = this.word.slice(typed.length);

    // Update dim remaining text
    this.wordText.setText(remaining);
    // Update bright typed text
    this.typedText.setText(typed);

    // Align both texts side by side
    const totalW  = this.wordText.width + this.typedText.width;
    const startX  = -totalW / 2;
    this.typedText.setX(startX);
    this.wordText.setX(startX + this.typedText.width);

    // Update HP bar for boss
    if (this.type === 'boss' && this.hpBar) {
      const ratio = 1 - typed.length / this.word.length;
      this._drawHpBar(ratio);
    }
  }

  freeze(frozen) {
    this.isFrozen = frozen;
  }

  setSpeedMod(mod) {
    this.speedMod = mod;
  }

  /** Move enemy downward. Call every frame with delta in ms. */
  update(delta) {
    if (!this.alive || this.isFrozen) return;
    const speed = this.baseSpeed * this.speedMod * (delta / 1000);
    this.container.y += speed;
  }

  /** Has the enemy reached the bottom of the screen? */
  isAtBottom(screenHeight = 854) {
    return this.container.y > screenHeight + 60;
  }

  /** Destroy with a particle burst effect */
  explode(onComplete) {
    this.alive = false;

    // Flash tween
    this.scene.tweens.add({
      targets:  this.body,
      alpha:    0,
      scaleX:   2,
      scaleY:   2,
      duration: 200,
      ease:     'Power2',
      onComplete: () => {
        this._spawnParticles();
        this.destroy();
        onComplete?.();
      },
    });

    // Labels fade out
    this.scene.tweens.add({
      targets:  [this.wordText, this.typedText],
      alpha:    0,
      duration: 150,
    });
  }

  _spawnParticles() {
    const cfg    = this.cfg;
    const x      = this.container.x;
    const y      = this.container.y;
    const scene  = this.scene;

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const dist  = Phaser.Math.Between(30, 70);
      const tx    = x + Math.cos(angle) * dist;
      const ty    = y + Math.sin(angle) * dist;
      const size  = Phaser.Math.Between(3, 8);

      const dot = scene.add.graphics();
      dot.fillStyle(cfg.color, 1);
      dot.fillCircle(0, 0, size);
      dot.setPosition(x, y);

      scene.tweens.add({
        targets:  dot,
        x:        tx,
        y:        ty,
        alpha:    0,
        scaleX:   0,
        scaleY:   0,
        duration: Phaser.Math.Between(300, 600),
        ease:     'Power2',
        onComplete: () => dot.destroy(),
      });
    }
  }

  /** Hard destroy — removes container and all children */
  destroy() {
    this.alive = false;
    this.container.destroy(true);
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }
}
