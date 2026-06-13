import Phaser from 'phaser';
import { WordManager } from './WordManager';

/**
 * Wave-based enemy spawn timing.
 *
 * Wave difficulty progression:
 *   - Spawn interval decreases as wave increases
 *   - Enemy type mix shifts toward harder types each wave
 *   - Boss spawns every 5 waves
 */

const ENEMY_TYPES = ['grunt', 'runner', 'tank', 'splitter'];

// Probability table [grunt, runner, tank, splitter] per wave tier
const TYPE_WEIGHTS = [
  [80, 20,  0,  0], // waves 1–2
  [60, 25, 10,  5], // waves 3–4
  [40, 30, 20, 10], // waves 5–7
  [25, 30, 25, 20], // waves 8–10
  [15, 25, 30, 30], // waves 11+
];

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export class SpawnManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {WordManager}  wordManager
   * @param {Function}     onSpawn - callback(enemyConfig)
   */
  constructor(scene, wordManager, onSpawn) {
    this.scene       = scene;
    this.wordManager = wordManager;
    this.onSpawn     = onSpawn;
    this.timer       = null;
    this.spawnCount  = 0;
    this.maxPerWave  = 10;
  }

  start(wave) {
    this.wave = wave;
    this.spawnCount = 0;
    this.maxPerWave = 8 + wave * 2; // more enemies per wave as game progresses

    const isBossWave = wave % 5 === 0;
    if (isBossWave) {
      // Boss wave: spawn boss first, then fewer grunts
      this._spawnBoss();
      this.maxPerWave = 4;
    }

    const interval = Math.max(600, 2200 - wave * 120); // ms between spawns
    this.timer = this.scene.time.addEvent({
      delay: interval,
      callback: this._spawnNext,
      callbackScope: this,
      loop: true,
    });
  }

  stop() {
    this.timer?.remove();
    this.timer = null;
  }

  _spawnNext() {
    if (this.spawnCount >= this.maxPerWave) {
      this.stop();
      return;
    }

    const type = this._pickType();
    const tier = WordManager.tierFor(type);
    const word = this.wordManager.pick(tier);
    const x    = Phaser.Math.Between(60, 420);

    this.onSpawn({ type, word, x, y: -40 });
    this.spawnCount++;

    // Stop timer immediately after the last enemy is spawned so
    // isDone becomes true right away — no waiting for an extra tick.
    if (this.spawnCount >= this.maxPerWave) {
      this.stop();
    }
  }

  _spawnBoss() {
    const word = this.wordManager.pick('boss');
    this.onSpawn({ type: 'boss', word, x: 240, y: -60 });
    this.spawnCount++;
  }

  _pickType() {
    const tier    = Math.min(Math.floor((this.wave - 1) / 2), TYPE_WEIGHTS.length - 1);
    const weights = TYPE_WEIGHTS[tier];
    const idx     = weightedRandom(weights);
    return ENEMY_TYPES[idx];
  }

  /** Check if all enemies have been spawned for this wave */
  get isDone() {
    return this.spawnCount >= this.maxPerWave && !this.timer;
  }
}
