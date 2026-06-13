# 🎯 Typing Shooter

> Destroy enemies by typing their words. Chain combos for massive scores.

**🔴 Live → [typeshooter-game.web.app](https://typeshooter-game.web.app)**

---

## 🕹️ How to Play

1. **Open the game** — enemies descend from the top of the screen, each carrying a word
2. **Type the word** above an enemy to lock on and destroy it
3. **Don't let enemies reach the bottom** — each one that slips past costs a life (you have 3)
4. **Chain kills** without missing to build your combo multiplier (up to **5× MAX**)
5. **Grab power-ups** — type their activation word when they appear on screen

### Controls
| Action | How |
|---|---|
| Type a word | Just type — no need to click anything |
| Backspace | Delete the last typed character |
| Lock on | Automatically targets the first enemy matching what you've typed |

### Enemy Types
| Enemy | Speed | Word Difficulty | Points |
|---|---|---|---|
| 🔷 Grunt | Slow | Easy (3–5 letters) | 100 |
| 🔺 Runner | Fast | Easy (3–4 letters) | 150 |
| 🔶 Tank | Very slow | Hard (7–10 letters) | 300 |
| 🟣 Splitter | Medium | Medium (5 letters) | 200 — splits into 2 Grunts on death |
| 🔴 Boss | Very slow | Boss (12–15 letters) | 1000 — every 5 waves |

### Power-ups (15% drop chance)
| Word to type | Effect | Duration |
|---|---|---|
| `ice` | Freezes all enemies | 4 seconds |
| `boom` | Nukes all enemies instantly | Instant |
| `x2` | Doubles all score | 10 seconds |
| `safe` | Absorbs your next miss | Until used |
| `slow` | Halves all enemy speed | 6 seconds |

### Scoring
```
score = word_length × 10 × enemy_type_multiplier × combo × powerup_bonus
```

---

## 🚀 Run Locally

```bash
git clone <repo-url>
cd typeshoot
npm install
npm run dev
# → http://localhost:5173/
```

## 📦 Build & Deploy

```bash
npm run build          # production bundle → dist/
firebase deploy        # deploy to Firebase Hosting
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Shell | React 18 |
| Game Engine | Phaser 3 |
| State Bridge | Zustand |
| Styling | Tailwind CSS |
| Build Tool | Vite 5 |
| PWA | vite-plugin-pwa |
| Hosting | Firebase Hosting |
| Persistence | localStorage (high score) |

---

## 📱 PWA — Install on Android

1. Open [typeshooter-game.web.app](https://typeshooter-game.web.app) in Chrome
2. Tap the **"Add to Home Screen"** prompt (or Menu → Install app)
3. Launch from your home screen — plays fullscreen, portrait-locked, works offline

---

## Keywords

`typing game` · `typing shooter` · `browser game` · `phaser 3` · `react game` · `pwa game` · `word game` · `keyboard game` · `combo game` · `arcade game` · `javascript game` · `vite` · `zustand` · `firebase hosting` · `offline game` · `mobile game`

---

## 🤖 Made with [Antigravity](https://antigravity.dev)
