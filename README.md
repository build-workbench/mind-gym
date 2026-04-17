<h1 align="center">
  🧠 Mind Gym
</h1>

<p align="center">
  <strong>Browser-based memory training for cognitive enhancement</strong>
</p>

<p align="center">
  <a href="https://github.com/LessUp/mind-gym/actions/workflows/ci.yml">
    <img src="https://github.com/LessUp/mind-gym/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/LessUp/mind-gym/actions/workflows/pages.yml">
    <img src="https://github.com/LessUp/mind-gym/actions/workflows/pages.yml/badge.svg" alt="Deploy">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA">
  </a>
</p>

<p align="center">
  English | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://lessup.github.io/mind-gym/">🎮 Play Online</a> •
  <a href="#installation">📱 Install</a> •
  <a href="#documentation">📖 Docs</a> •
  <a href="#contributing">🤝 Contribute</a>
</p>

---

## ✨ Features

### Training Modes

| Mode                 | Description                                           | Cognitive Target                  |
| -------------------- | ----------------------------------------------------- | --------------------------------- |
| **Classic Matching** | Flip cards to find matching pairs (4×4, 4×5, 6×6)     | Visual memory, attention          |
| **Countdown Mode**   | Race against configurable time limits                 | Processing speed, stress handling |
| **Daily Challenge**  | Same card layout for all players worldwide            | Consistency, competition          |
| **N-back Training**  | Working memory exercise — match stimulus N-steps back | Working memory, focus             |
| **Delayed Recall**   | Post-game recognition test                            | Long-term memory consolidation    |

### Adaptive Intelligence

- **Adaptive Difficulty** — Adjusts preview time and hints based on performance (ELO-like rating 600-1600)
- **Spaced Reinforcement** — Prioritizes challenging cards using decay-weighted selection
- **Combo System** — 5-second window for consecutive match bonuses
- **Star Ratings** — Performance scoring based on time, moves, hints, and combos

### User Experience

| Feature                     | Description                           |
| --------------------------- | ------------------------------------- |
| 🌍 **Full i18n**            | Chinese & English with auto-detection |
| 📲 **PWA Support**          | Installable, works offline            |
| ⌨️ **Keyboard Shortcuts**   | Complete keyboard navigation          |
| 📊 **Statistics Dashboard** | Track progress across all metrics     |
| 🏆 **Achievement System**   | Unlock milestones                     |
| 💾 **Data Backup**          | Export/import all progress as JSON    |

---

## 🚀 Quick Start

### Play Online

Visit **[https://lessup.github.io/mind-gym/](https://lessup.github.io/mind-gym/)** to play immediately in your browser.

### Install as PWA

#### Desktop

**Chrome/Edge:**

1. Visit the site
2. Click the install icon (➕) in the address bar
3. Launch from desktop

#### Mobile

**iOS Safari:**

1. Tap Share → "Add to Home Screen"

**Android Chrome:**

1. Tap Menu → "Add to Home screen"

### Local Development

```bash
# Clone repository
git clone https://github.com/LessUp/mind-gym.git
cd mind-gym

# Install dependencies
npm install

# Start local server
npx serve .
```

### Development Commands

| Command                  | Purpose               |
| ------------------------ | --------------------- |
| `npm test`               | Run Jest unit tests   |
| `npm run lint`           | Check code formatting |
| `npm run format`         | Auto-format all files |
| `npm run build:css`      | Compile Tailwind CSS  |
| `npm run prepare:deploy` | Build + copy to dist/ |

---

## 📁 Project Structure

```
mind-gym/
├── specs/                # Spec-Driven Development documents
│   ├── product/          # Product feature specifications
│   ├── rfc/              # Technical design documents
│   ├── db/               # Data model definitions
│   └── testing/          # Test specifications
├── docs/                 # User guides and tutorials
├── changelog/            # Version history
├── index.html            # Main SPA entry
├── app.js                # Game orchestrator (state machine, modes)
├── sw.js                 # Service Worker (offline caching)
├── manifest.webmanifest  # PWA manifest
├── src/                  # Modular source (UMD)
│   ├── storage.js        # localStorage CRUD
│   ├── stats.js          # Statistics aggregation
│   ├── achievements.js   # Achievement logic
│   ├── modes.js          # N-back & recall logic
│   ├── i18n.js           # Internationalization
│   ├── timer.js          # Timer management
│   └── ...               # Additional modules
├── __tests__/            # Jest tests
└── assets/               # Icons, CSS, static files
```

---

## 🎮 Keyboard Shortcuts

| Key               | Action                       |
| ----------------- | ---------------------------- |
| `N`               | New game                     |
| `P`               | Pause / Resume               |
| `H`               | Use hint                     |
| `J`               | N-back match (during N-back) |
| `↑↓←→`            | Navigate cards               |
| `Enter` / `Space` | Flip selected card           |
| `Escape`          | Close modal                  |

---

## 🛠 Technology Stack

| Layer       | Technology                                              |
| ----------- | ------------------------------------------------------- |
| **Runtime** | Vanilla JavaScript (ES2022) — zero runtime dependencies |
| **Styling** | Tailwind CSS 3.4 (CLI compiled)                         |
| **Storage** | localStorage for persistence                            |
| **Testing** | Jest 30 + jsdom                                         |
| **CI/CD**   | GitHub Actions                                          |
| **Hosting** | GitHub Pages                                            |

### Browser Support

| Browser | Version | PWA Install |
| ------- | ------- | ----------- |
| Chrome  | 90+     | ✅          |
| Firefox | 90+     | ✅          |
| Safari  | 14+     | ⚠️\*        |
| Edge    | 90+     | ✅          |

\* Safari: Use "Add to Home Screen" from share menu

---

## 📊 Data Storage

All data is stored locally in `localStorage` with the `memory_match_` prefix:

| Key                  | Data                       |
| -------------------- | -------------------------- |
| `_settings`          | User preferences           |
| `_best_<difficulty>` | Best scores                |
| `_lb_<difficulty>`   | Leaderboards               |
| `_stats`             | Aggregate statistics       |
| `_achievements`      | Unlocked achievements      |
| `_adaptive`          | Adaptive rating (600-1600) |

See [docs/storage.md](docs/storage.md) for complete data structures.

---

## 📖 Documentation

### User Documentation

| Document                        | Description                        |
| ------------------------------- | ---------------------------------- |
| [Training Modes](docs/modes.md) | Mode specifications and algorithms |
| [PWA/Offline](docs/pwa.md)      | Service Worker and caching         |

### Developer Documentation

| Document                             | Description                               |
| ------------------------------------ | ----------------------------------------- |
| [Architecture](docs/architecture.md) | System design and data flow               |
| [Storage Model](docs/storage.md)     | Data structures and persistence           |
| [Product Specs](specs/product/)      | Feature definitions & acceptance criteria |
| [Technical RFCs](specs/rfc/)         | Architecture decisions                    |
| [Database Schema](specs/db/)         | Data model specifications                 |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. **Review or create relevant Spec documents** in `/specs/`
4. Make changes following our code style
5. Run tests (`npm test`)
6. Commit with clear messages
7. Push and open a Pull Request

---

## 📝 License

[MIT License](LICENSE) © LessUp

---

<p align="center">
  Made with ❤️ for cognitive health
</p>
