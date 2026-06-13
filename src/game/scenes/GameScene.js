import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';
import { gameEvents } from '../events';
import { Enemy } from '../objects/Enemy';
import { PowerUp } from '../objects/PowerUp';
import { WordManager } from '../systems/WordManager';
import { SpawnManager } from '../systems/SpawnManager';
import { ComboSystem } from '../systems/ComboSystem';
import { ScoreManager } from '../systems/ScoreManager';

const CANVAS_W = 480;
const CANVAS_H = 854;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // ── State ────────────────────────────────────────────────────
    this.enemies    = [];
    this.powerUps   = [];
    this.lockedEnemy = null;   // enemy currently being typed
    this.typed      = '';
    this.waveEnemiesLeft = 0;
    this.waveComplete    = false;
    this.betweenWaves    = false;
    this.powerUpActive   = null;  // { type, expiresAt }
    this.shieldActive    = false;

    // ── Systems ──────────────────────────────────────────────────
    this.wordManager  = new WordManager();
    this.comboSystem  = new ComboSystem();
    this.scoreManager = new ScoreManager();
    this.spawnManager = new SpawnManager(this, this.wordManager, (cfg) => this._spawnEnemy(cfg));

    // Reset Zustand state
    useGameStore.getState().resetGame();

    // ── Background ───────────────────────────────────────────────
    this._buildBackground();

    // ── Typed text display (bottom of canvas) ────────────────────
    this.typedDisplay = this.add.text(CANVAS_W / 2, CANVAS_H - 30, '', {
      fontFamily: 'Orbitron, monospace',
      fontSize:   '20px',
      color:      '#00ffcc',
      stroke:     '#000000',
      strokeThickness: 4,
      align:      'center',
    }).setOrigin(0.5, 1).setDepth(10);

    // Cursor underscore blink
    this.cursorVisible = true;
    this.time.addEvent({
      delay: 530,
      callback: () => { this.cursorVisible = !this.cursorVisible; this._refreshDisplay(); },
      loop: true,
    });

    // ── Danger zone line ─────────────────────────────────────────
    const zoneLine = this.add.graphics();
    zoneLine.lineStyle(1, 0xff2d78, 0.35);
    zoneLine.lineBetween(0, CANVAS_H - 70, CANVAS_W, CANVAS_H - 70);

    // ── Wave label (temporary) ───────────────────────────────────
    this.waveLabel = this.add.text(CANVAS_W / 2, CANVAS_H / 2, '', {
      fontFamily: 'Orbitron, monospace',
      fontSize:   '32px',
      color:      '#9f50ff',
      stroke:     '#000000',
      strokeThickness: 5,
      align:      'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(20);

    // ── Input events (from React TypeInput via EventEmitter) ──────
    this._charUnsubscribe = gameEvents.on('char', (ch) => this._handleChar(ch));
    this._backUnsubscribe = gameEvents.on('backspace', ()  => this._handleBackspace());

    // ── Start wave 1 ─────────────────────────────────────────────
    this._startWave(1);
  }

  // ── Background ───────────────────────────────────────────────────

  _buildBackground() {
    const bg = this.add.graphics();

    // Deep space gradient using rectangles
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0f0f2a, 0x0f0f2a, 1);
    bg.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Star field
    for (let i = 0; i < 120; i++) {
      const x    = Phaser.Math.Between(0, CANVAS_W);
      const y    = Phaser.Math.Between(0, CANVAS_H);
      const size = Math.random() < 0.1 ? 2 : 1;
      const alpha = Phaser.Math.FloatBetween(0.2, 0.9);
      bg.fillStyle(0xffffff, alpha);
      bg.fillCircle(x, y, size);
    }

    // Subtle grid lines
    bg.lineStyle(1, 0x1a1a3a, 1);
    for (let x = 0; x <= CANVAS_W; x += 60) {
      bg.lineBetween(x, 0, x, CANVAS_H);
    }
    for (let y = 0; y <= CANVAS_H; y += 60) {
      bg.lineBetween(0, y, CANVAS_W, y);
    }

    // Bottom glow
    const bottomGlow = this.add.graphics();
    bottomGlow.fillGradientStyle(0x000000, 0x000000, 0x00ffcc, 0x00ffcc, 0, 0, 0.08, 0.08);
    bottomGlow.fillRect(0, CANVAS_H - 100, CANVAS_W, 100);
  }

  // ── Wave management ───────────────────────────────────────────────

  _startWave(wave) {
    useGameStore.getState().setWave(wave);
    this.wordManager.resetWave();
    this.waveComplete    = false;
    this.betweenWaves    = false;
    this.waveEnemiesLeft = 0;

    const isBoss = wave % 5 === 0;

    // Flash wave number
    this.waveLabel.setText(isBoss ? `⚠ BOSS WAVE ${wave} ⚠` : `WAVE ${wave}`);
    this.waveLabel.setColor(isBoss ? '#ff2d78' : '#9f50ff');
    this.tweens.add({
      targets: this.waveLabel,
      alpha:   { from: 0, to: 1 },
      duration: 400,
      hold:     800,
      yoyo:     true,
    });

    this.spawnManager.start(wave);
  }

  _checkWaveComplete() {
    if (
      this.spawnManager.isDone &&
      this.enemies.filter((e) => e.alive).length === 0 &&
      !this.waveComplete &&
      !this.betweenWaves
    ) {
      this.waveComplete  = true;
      this.betweenWaves  = true;
      const nextWave = useGameStore.getState().wave + 1;

      this.time.delayedCall(1800, () => {
        this._startWave(nextWave);
      });
    }
  }

  // ── Enemy spawning ────────────────────────────────────────────────

  _spawnEnemy(cfg) {
    const enemy = new Enemy(this, cfg);
    this.enemies.push(enemy);
    this.waveEnemiesLeft++;

    // Entrance tween
    enemy.container.setAlpha(0);
    this.tweens.add({
      targets:  enemy.container,
      alpha:    1,
      duration: 300,
    });
  }

  // ── Power-up management ───────────────────────────────────────────

  _spawnPowerUp(x, y) {
    if (Math.random() > 0.15) return; // 15% drop chance

    const types = ['freeze', 'nuke', 'x2', 'shield', 'slow'];
    const type  = types[Math.floor(Math.random() * types.length)];
    const pu    = new PowerUp(this, { type, x, y });
    this.powerUps.push(pu);
  }

  _activatePowerUp(type) {
    const now       = Date.now();
    const DURATIONS = { freeze: 4000, nuke: 0, x2: 10000, shield: null, slow: 6000 };
    const dur       = DURATIONS[type];

    switch (type) {
      case 'freeze':
        this.enemies.forEach((e) => e.freeze(true));
        this.powerUpActive = { type, expiresAt: now + dur };
        useGameStore.getState().setActivePowerUp({ type, startedAt: now, expiresAt: now + dur });
        this.time.delayedCall(dur, () => {
          this.enemies.forEach((e) => e.freeze(false));
          this.powerUpActive = null;
          useGameStore.getState().setActivePowerUp(null);
        });
        break;

      case 'nuke':
        this.powerUpActive = { type, expiresAt: now };
        useGameStore.getState().setActivePowerUp({ type, startedAt: now, expiresAt: now + 800 });
        [...this.enemies].forEach((e) => {
          if (e.alive) {
            this.comboSystem.onKill();
            this.scoreManager.award(e, useGameStore.getState().combo, false);
            e.explode();
          }
        });
        this.enemies = [];
        this.time.delayedCall(800, () => {
          this.powerUpActive = null;
          useGameStore.getState().setActivePowerUp(null);
        });
        break;

      case 'x2':
        this.powerUpActive = { type, expiresAt: now + dur };
        useGameStore.getState().setActivePowerUp({ type, startedAt: now, expiresAt: now + dur });
        this.time.delayedCall(dur, () => {
          this.powerUpActive = null;
          useGameStore.getState().setActivePowerUp(null);
        });
        break;

      case 'shield':
        this.shieldActive  = true;
        this.powerUpActive = { type, expiresAt: Infinity };
        useGameStore.getState().setActivePowerUp({ type, startedAt: now, expiresAt: Infinity });
        break;

      case 'slow':
        this.enemies.forEach((e) => e.setSpeedMod(0.5));
        this.powerUpActive = { type, expiresAt: now + dur };
        useGameStore.getState().setActivePowerUp({ type, startedAt: now, expiresAt: now + dur });
        this.time.delayedCall(dur, () => {
          this.enemies.forEach((e) => e.setSpeedMod(1));
          this.powerUpActive = null;
          useGameStore.getState().setActivePowerUp(null);
        });
        break;
    }
  }

  // ── Input handling ────────────────────────────────────────────────

  _handleChar(ch) {
    this.typed += ch;
    this._updateLockOn();
    useGameStore.getState().setCurrentTyped(this.typed);
    this._refreshDisplay();
  }

  _handleBackspace() {
    if (this.typed.length === 0) return;
    this.typed = this.typed.slice(0, -1);
    this._updateLockOn();
    useGameStore.getState().setCurrentTyped(this.typed);
    this._refreshDisplay();
  }

  /**
   * Find the best enemy or power-up matching the current typed string.
   * Priority: currently locked enemy → new match starting with typed → power-ups
   */
  _updateLockOn() {
    const t = this.typed;
    if (!t) {
      this._clearLockOn();
      return;
    }

    // Check active power-ups first
    for (const pu of this.powerUps) {
      if (pu.alive && pu.word === t) {
        this._activatePowerUp(pu.type);
        pu.destroy();
        this.powerUps = this.powerUps.filter((p) => p !== pu);
        this.typed = '';
        useGameStore.getState().setCurrentTyped('');
        return;
      }
    }

    // Check if locked enemy still matches
    if (this.lockedEnemy?.alive && this.lockedEnemy.word.startsWith(t)) {
      this._syncLockedEnemy();
      return;
    }

    // Find a new enemy to lock onto
    this._clearLockOn();
    const match = this.enemies.find((e) => e.alive && e.word.startsWith(t));
    if (match) {
      this.lockedEnemy = match;
      this._syncLockedEnemy();
    }
  }

  _syncLockedEnemy() {
    const e = this.lockedEnemy;
    if (!e || !e.alive) return;

    // Sync typed progress
    e.typed = '';
    for (const ch of this.typed) {
      const done = e.typeChar(ch);
      if (done) {
        this._killEnemy(e);
        return;
      }
    }
  }

  _clearLockOn() {
    this.enemies.forEach((e) => e.resetTyped());
    this.lockedEnemy = null;
  }

  _refreshDisplay() {
    const cursor = this.cursorVisible ? '_' : ' ';
    const t = this.typed || '';
    this.typedDisplay?.setText(t ? `> ${t}${cursor}` : cursor);
  }

  // ── Kill / miss ───────────────────────────────────────────────────

  _killEnemy(enemy) {
    const combo       = this.comboSystem.onKill();
    const hasX2       = this.powerUpActive?.type === 'x2';
    const delta       = this.scoreManager.award(enemy, combo, hasX2);

    useGameStore.getState().setCombo(combo);

    // Score popup
    this._scorePopup(enemy.x, enemy.y, `+${delta}`);

    // Splitter — spawn two grunts
    if (enemy.type === 'splitter') {
      this.time.delayedCall(100, () => {
        this._spawnEnemy({ type: 'grunt', word: this.wordManager.pick('easy'), x: enemy.x - 30, y: enemy.y });
        this._spawnEnemy({ type: 'grunt', word: this.wordManager.pick('easy'), x: enemy.x + 30, y: enemy.y });
      });
    }

    // Power-up drop
    this._spawnPowerUp(enemy.x, enemy.y);

    enemy.explode();
    this.enemies = this.enemies.filter((e) => e !== enemy);
    this.lockedEnemy = null;
    this.typed = '';
    useGameStore.getState().setCurrentTyped('');
    this._refreshDisplay();
    this._checkWaveComplete();
  }

  _missEnemy(enemy) {
    // Shield absorbs one miss
    if (this.shieldActive) {
      this.shieldActive = false;
      this.powerUpActive = null;
      useGameStore.getState().setActivePowerUp(null);
      this._screenFlash(0x9f50ff, 0.3);
      enemy.destroy();
      this.enemies = this.enemies.filter((e) => e !== enemy);
      if (this.lockedEnemy === enemy) {
        this.lockedEnemy = null;
        this.typed = '';
        this._refreshDisplay();
      }
      return;
    }

    const { lives } = useGameStore.getState();
    useGameStore.getState().setLives(lives - 1);
    const newCombo = this.comboSystem.onMiss();
    useGameStore.getState().setCombo(newCombo);

    this._screenFlash(0xff2d78, 0.4);

    enemy.destroy();
    this.enemies = this.enemies.filter((e) => e !== enemy);
    if (this.lockedEnemy === enemy) {
      this.lockedEnemy = null;
      this.typed = '';
      this._refreshDisplay();
    }

    if (lives - 1 <= 0) {
      this._gameOver();
    }

    this._checkWaveComplete();
  }

  // ── Game over ─────────────────────────────────────────────────────

  _gameOver() {
    useGameStore.getState().saveHighScore();
    // Slight delay so score save completes
    this.time.delayedCall(600, () => {
      useGameStore.getState().setScreen('gameover');
    });
  }

  // ── Visual helpers ────────────────────────────────────────────────

  _screenFlash(color, alpha) {
    const flash = this.add.graphics().setDepth(50);
    flash.fillStyle(color, alpha);
    flash.fillRect(0, 0, CANVAS_W, CANVAS_H);
    this.tweens.add({
      targets:  flash,
      alpha:    0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  _scorePopup(x, y, text) {
    const t = this.add.text(x, y - 10, text, {
      fontFamily: 'Orbitron, monospace',
      fontSize:   '16px',
      color:      '#00ffcc',
      stroke:     '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets:  t,
      y:        y - 60,
      alpha:    0,
      duration: 900,
      ease:     'Power2',
      onComplete: () => t.destroy(),
    });
  }

  // ── Main update loop ──────────────────────────────────────────────

  update(time, delta) {
    // Move enemies
    for (const enemy of this.enemies) {
      enemy.update(delta);
      if (enemy.isAtBottom(CANVAS_H)) {
        this._missEnemy(enemy);
        return; // restart frame to avoid mutation-while-iterating
      }
    }

    // Move power-ups
    for (const pu of this.powerUps) {
      pu.update(delta);
      if (pu.isAtBottom(CANVAS_H)) {
        pu.destroy();
      }
    }
    this.powerUps = this.powerUps.filter((p) => p.alive);

    // Expire x2 and other timed power-ups
    if (this.powerUpActive && this.powerUpActive.expiresAt !== Infinity) {
      if (Date.now() >= this.powerUpActive.expiresAt) {
        // Already handled via delayedCall, this is a safety cleanup
        this.powerUpActive = null;
      }
    }

    // Safety net: poll wave completion every frame.
    // Catches the edge case where the last enemy was killed before
    // the spawn timer ticked to set isDone=true.
    this._checkWaveComplete();
  }

  // ── Cleanup ───────────────────────────────────────────────────────

  shutdown() {
    this._charUnsubscribe?.();
    this._backUnsubscribe?.();
    gameEvents.removeAll('char');
    gameEvents.removeAll('backspace');
  }
}
