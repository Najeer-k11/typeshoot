/**
 * Tracks kill streaks and returns the current combo multiplier.
 * Resets on miss or game restart.
 *
 * Thresholds:
 *   1 kill  → 1×   (no badge)
 *   2 kills → 2×
 *   4 kills → 3×
 *   7 kills → 4×
 *   10+     → 5× MAX
 */
export class ComboSystem {
  constructor() {
    this.kills = 0;
  }

  /** Call on every successful word completion. Returns new multiplier. */
  onKill() {
    this.kills++;
    return this.multiplier;
  }

  /** Call on any missed enemy. Returns reset multiplier (1). */
  onMiss() {
    this.kills = 0;
    return 1;
  }

  reset() {
    this.kills = 0;
  }

  get multiplier() {
    if (this.kills >= 10) return 5;
    if (this.kills >= 7)  return 4;
    if (this.kills >= 4)  return 3;
    if (this.kills >= 2)  return 2;
    return 1;
  }
}
