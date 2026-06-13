import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────────────────
  score: 0,
  lives: 3,
  wave: 1,
  combo: 1,
  highScore: parseInt(localStorage.getItem('highScore') || '0'),
  activePowerUp: null,   // { type: string, expiresAt: number } | null
  currentTyped: '',
  screen: 'menu',        // 'menu' | 'game' | 'gameover'
  lastKilledWave: 1,

  // ── Actions (callable from both Phaser and React) ────────────────────
  setScore:        (score)      => set({ score }),
  setLives:        (lives)      => set({ lives }),
  setWave:         (wave)       => set({ wave }),
  setCombo:        (combo)      => set({ combo }),
  setActivePowerUp:(powerUp)    => set({ activePowerUp: powerUp }),
  setCurrentTyped: (text)       => set({ currentTyped: text }),
  setScreen:       (screen)     => set({ screen }),
  setLastKilledWave:(wave)      => set({ lastKilledWave: wave }),

  saveHighScore: () => {
    const { score, highScore } = get();
    if (score > highScore) {
      localStorage.setItem('highScore', String(score));
      set({ highScore: score });
      return true; // new high score
    }
    return false;
  },

  resetGame: () => set({
    score: 0,
    lives: 3,
    wave: 1,
    combo: 1,
    activePowerUp: null,
    currentTyped: '',
    lastKilledWave: 1,
  }),
}));
