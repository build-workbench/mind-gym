# Mind Gym

[![CI](https://github.com/LessUp/mind-gym/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/mind-gym/actions/workflows/ci.yml)
[![Deploy](https://github.com/LessUp/mind-gym/actions/workflows/pages.yml/badge.svg)](https://github.com/LessUp/mind-gym/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)

English | [简体中文](README.zh-CN.md)

A browser-based memory training game combining cognitive science principles with intuitive interaction design. Features multiple training modes including classic matching, timed challenges, daily challenges, N-back training, and delayed recall tests.

## ✨ Features

### Game Modes

| Mode                 | Description                                                                  |
| -------------------- | ---------------------------------------------------------------------------- |
| **Classic Matching** | Flip cards to find matching pairs across 3 difficulty levels (4×4, 4×5, 6×6) |
| **Countdown Mode**   | Race against time with configurable time limits per difficulty               |
| **Daily Challenge**  | Same card layout for all players worldwide, seeded by date                   |
| **N-Back Training**  | Working memory exercise — judge if current stimulus matches N steps back     |
| **Delayed Recall**   | Post-game quiz to test memory of cards that appeared                         |

### Adaptive Features

- **Adaptive Difficulty** — Automatically adjusts preview time and hint counts based on performance
- **Spaced Reinforcement** — Prioritizes challenging cards in future rounds
- **Combo System** — Consecutive matches within 5 seconds build combos
- **Star Ratings** — Performance scored based on time, moves, hints, and combos

### User Experience

- **Full i18n** — Chinese and English with automatic browser language detection
- **PWA Support** — Installable, works offline via Service Worker
- **Keyboard Shortcuts** — Full keyboard navigation support
- **Statistics Dashboard** — Track games, win rate, average times, recall precision, N-back accuracy
- **Achievement System** — Unlock achievements for various milestones
- **Data Backup** — Export/import all progress as JSON

## 🚀 Quick Start

### Play Online

Visit [GitHub Pages](https://lessup.github.io/mind-gym/) to play immediately.

### Local Development

```bash
# Clone the repository
git clone https://github.com/LessUp/mind-gym.git
cd mind-gym

# Install dev dependencies (for testing and CSS building)
npm install

# Start a local server (any static server works)
npx serve .
# Or simply open index.html in your browser
```

### Development Commands

```bash
npm test              # Run Jest unit tests
npm run lint          # Check code formatting with Prettier
npm run format        # Auto-format all files
npm run build:css     # Compile Tailwind CSS → assets/app.css
npm run prepare:deploy  # Build CSS + copy files to dist/
```

## 📁 Project Structure

```
mind-gym/
├── index.html              # Main HTML (single-page app)
├── app.js                  # Game orchestrator: state machine, modes, UI coordination
├── sw.js                   # Service Worker: offline caching
├── manifest.webmanifest    # PWA manifest
│
├── src/                    # Modular source files (UMD format)
│   ├── keys.js             # localStorage key constants
│   ├── utils.js            # Shuffle, seeded RNG, HTML escape
│   ├── storage.js          # localStorage CRUD operations
│   ├── stats.js            # Statistics tracking logic
│   ├── achievements.js     # Achievement definitions and checking
│   ├── modes.js            # N-back and recall mode logic
│   ├── import-export.js    # Data normalization for backup/restore
│   ├── i18n.js             # Internationalization dictionaries
│   ├── effects.js          # Sound effects (Web Audio) & vibration
│   ├── pools.js            # Card face asset pools
│   ├── timer.js            # Game timer (elapsed & countdown)
│   ├── confetti.js         # Victory animation (Canvas 2D)
│   ├── ui.js               # DOM element bindings
│   └── ui-events.js        # Event listener registration
│
├── __tests__/              # Jest unit tests
├── docs/                   # Architecture & design documentation
├── changelog/              # Version history
├── scripts/                # Deployment scripts
└── assets/                 # Icons, CSS, static assets
```

## 🎮 Keyboard Shortcuts

| Key               | Action                |
| ----------------- | --------------------- |
| `N`               | New game              |
| `P`               | Pause / Resume        |
| `H`               | Use hint              |
| `J`               | N-back match response |
| `↑↓←→`            | Navigate cards        |
| `Enter` / `Space` | Flip selected card    |
| `Escape`          | Close modal           |

## 🛠 Tech Stack

- **Runtime**: Vanilla JavaScript (ES2022), zero runtime dependencies
- **Styling**: Tailwind CSS (CLI compiled, no CDN in production)
- **Storage**: localStorage for settings, stats, achievements
- **Testing**: Jest 30 + jsdom
- **CI/CD**: GitHub Actions (Node 22)
- **Deployment**: GitHub Pages

## 📊 Data Storage

All data is stored locally in `localStorage` with the `memory_match_` prefix:

| Key                          | Description                           |
| ---------------------------- | ------------------------------------- |
| `_settings`                  | User preferences                      |
| `_best_<difficulty>`         | Best time/moves per difficulty        |
| `_lb_<difficulty>`           | Leaderboard (top 3) per difficulty    |
| `_achievements`              | Unlocked achievements                 |
| `_stats`                     | Cumulative statistics                 |
| `_adaptive`                  | Adaptive difficulty rating (600-1600) |
| `_spaced_<theme>`            | Spaced reinforcement weights          |
| `_daily_<date>_<difficulty>` | Daily challenge completion            |

See [docs/storage.md](docs/storage.md) for detailed data structures.

## 📖 Documentation

- [Architecture Overview](docs/architecture.md) — System design and data flow
- [Training Modes](docs/modes.md) — Detailed mode descriptions
- [Storage Model](docs/storage.md) — Data structures and persistence
- [PWA/Offline](docs/pwa.md) — Service Worker caching strategy

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

[MIT License](LICENSE)
