import { WORDS } from '../data/words';

export class WordManager {
  constructor() {
    this._used = { easy: new Set(), medium: new Set(), hard: new Set(), boss: new Set() };
  }

  /**
   * Pick a random unused word from the given tier.
   * Resets the pool if all words have been used.
   */
  pick(tier = 'easy') {
    const pool = WORDS[tier] || WORDS.easy;
    const used = this._used[tier] || new Set();

    let available = pool.filter((w) => !used.has(w));
    if (available.length === 0) {
      // Reset pool
      used.clear();
      available = [...pool];
    }

    const word = available[Math.floor(Math.random() * available.length)];
    used.add(word);
    return word;
  }

  resetWave() {
    for (const tier of Object.keys(this._used)) {
      this._used[tier].clear();
    }
  }

  /** Tier for a given enemy type */
  static tierFor(enemyType) {
    switch (enemyType) {
      case 'boss':     return 'boss';
      case 'tank':     return 'hard';
      case 'splitter': return 'medium';
      case 'runner':   return 'easy';
      default:         return 'easy'; // grunt
    }
  }
}
