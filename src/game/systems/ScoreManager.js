import { useGameStore } from '../../store/gameStore';

/** Score multipliers per enemy type */
const TYPE_MULTIPLIER = {
  grunt:    1,
  runner:   1.5,
  tank:     3,
  splitter: 2,
  boss:     10,
};

export class ScoreManager {
  /**
   * Calculate and apply score for a killed enemy.
   * @param {object} enemy  - enemy instance with .word and .type
   * @param {number} combo  - current combo multiplier
   * @param {boolean} doublePoints - active x2 power-up
   */
  award(enemy, combo, doublePoints = false) {
    const base       = enemy.word.length * 10;
    const typeBonus  = TYPE_MULTIPLIER[enemy.type] || 1;
    const powerBonus = doublePoints ? 2 : 1;
    const delta      = Math.round(base * typeBonus * combo * powerBonus);

    const { score, setScore } = useGameStore.getState();
    setScore(score + delta);
    return delta;
  }
}
