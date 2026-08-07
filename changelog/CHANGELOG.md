# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

本条目的所有显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [v1.11.1] - 2026-08-07

### Removed / 移除

- 移除 `openspec/` 规范文档（OpenSpec 流程）
- 移除 `docs/` VitePress 白皮书站点与相关测试
- 移除根文档与贡献模板（`AGENTS.md`、`CLAUDE.md`、`CONTRIBUTING.md` 等）
- 移除工具与编辑器残留文件
- 移除 lighthouse 审计设施与相关 npm 脚本
- 移除英文 README 与 `docs/en`

### Changed / 变更

- 精简 CI 为轻量 lint + test + build:css 验证
- 瘦身 `app.js` 与 `index.html`，清理冗余工程文件
- 重写 README 为精简版并更新 ignore 配置
- 修复 PWA 缓存版本号以驱逐过期 v1.11.0 资源
- 修复 GitHub Pages 游戏初始化
- 迁移仓库至 vibe-knight 组织，更新全部仓库链接与部署地址

### Technical / 技术细节

- 总测试数: 359 (24 测试套件)
- 零运行时依赖，PWA 离线可用

---

## [v1.11.0] - 2026-05-08

### Added / 新增

- `openspec/changes/.gitkeep` - OpenSpec 变更目录
- `openspec/explorations/.gitkeep` - OpenSpec 探索目录

### Changed / 变更

- 更新所有文档中的模块加载顺序
- 增强 `AGENTS.md` - 添加三层状态架构和深度模块设计原则
- 增强 `CLAUDE.md` - 添加完整架构决策记录
- 增强 `.github/copilot-instructions.md` - 补充深度模块设计模式
- 更新 `CONTRIBUTING.md` - 补充新模块列表

### Technical / 技术细节

- 总测试数: 291 (19 测试套件)
- 文档全面更新，深度注入项目业务逻辑
- GitHub 仓库 homepage URL 更新

---

## [v1.10.0] - 2026-04-29

### Added / 新增

- `src/shared.js` - 共享工具函数模块
  - `isPlainObject()` - 判断纯对象
  - `clampInt()` - 整数约束
  - `clampNumber()` - 数值约束
- `__tests__/shared.test.js` - 17 个测试用例

### Changed / 变更

- 消除代码重复：从 4 个模块提取公共函数到 shared.js
  - `src/stats.js` - 引用 shared.js
  - `src/modes.js` - 引用 shared.js
  - `src/import-export.js` - 引用 shared.js
  - `src/achievements.js` - 引用 shared.js
- 更新模块加载顺序文档

### Technical / 技术细节

- 总测试数: 210 (新增 17)
- 代码重复减少约 40 行

---

## [v1.9.0] - 2026-04-28

### Added / 新增

- **FSRS-4.5 Mastery System**: Modern spaced repetition algorithm
  - `src/fsrs.js` module with core FSRS-4.5 implementation
  - Card mastery tracking with stability and difficulty metrics
  - Intelligent review scheduling based on retrievability
  - Game performance → FSRS rating mapping (Again/Hard/Good/Easy)
  - Migration from legacy spaced weights to mastery format

### Changed / 变更

- Updated `openspec/specs/adaptive-systems/spec.md` with FSRS documentation
- Updated Service Worker cache version to v7
- Enhanced card selection with FSRS-based prioritization

### Technical / 技术细节

- New localStorage key: `memory_match_mastery_<theme>`
- 22 new test cases for FSRS functions
- Total: 187 tests passing

---

## [v1.8.0] - 2026-04-27

### Added / 新增

- `jsconfig.json` for LSP type checking support
- `openspec/changes/archive/.gitkeep` for directory structure

### Changed / 变更

- Consolidated documentation: removed redundant docs/, use openspec/specs/ as source of truth
- Optimized Service Worker: removed debug logs, added DEBUG flag
- Updated docs/README.md as user guide entry point

### Fixed / 修复

- **Critical**: `isReducedMotion()` logic was inverted - motion preference now works correctly
- **Critical**: `createDeck()` now falls back to emoji theme when pool is invalid

### Removed / 移除

- Redundant documentation files (9 files deleted)
- Root `CHANGELOG.md` (use `changelog/CHANGELOG.md` instead)

---

## [v1.6.1] - 2026-04-16

### Added / 新增

- Complete bilingual (EN/ZH) documentation for all docs/
- Professional documentation structure with navigation
- Changelog archive system with bilingual release notes

### Changed / 变更

- Refactored all documentation with improved formatting
- Updated README with enhanced structure

---

## [v1.6.0] - 2026-04-16

### Added / 新增

- `.github/workflows/dependency-review.yml` for dependency auditing
- Issue templates: bug_report, feature_request, documentation
- Enhanced Service Worker with message handling and sync support
- Build verification steps in CI workflow
- Coverage report upload in CI

### Changed / 变更

- Optimized pages.yml with timeouts, caching, and dist verification
- Split ci.yml into lint, test, build jobs with ci-passed summary
- Enhanced pr-title.yml with auto-labeling
- Improved manifest.webmanifest with shortcuts and metadata
- Updated pull_request_template.md with emojis and expanded scopes

[View details](./archive/v1.6.0.md)

---

## [v1.5.0] - 2026-04-16

### Added / 新增

- Root `CHANGELOG.md` with complete version history
- `changelog/README.md` with version table and writing guidelines
- Changelog writing template and naming convention

### Changed / 变更

- Unified all changelog file naming: `YYYY-MM-DD_short-title.md`
- Standardized changelog format with version numbers
- Added tables for structured data in all changelog files

### Removed / 移除

- Deprecated old changelog files with inconsistent naming

[View details](./archive/v1.5.0.md)

---

## [v1.4.0] - 2026-04-16

### Added / 新增

- Comprehensive documentation refactor across all files
- ASCII architecture diagram in docs/architecture.md
- TypeScript type definitions in docs/storage.md
- Keyboard shortcuts tables in README files
- Data storage tables in README files
- Code examples throughout documentation

### Changed / 变更

- Unified documentation style with tables and code blocks
- Improved CONTRIBUTING.md with detailed guidelines
- Enhanced CLAUDE.md with complete module loading order

[View details](./archive/v1.4.0.md)

---

## [v1.3.0] - 2026-04-16

### Changed / 变更

- Formatted all code with Prettier (31 files)
- Updated `caniuse-lite` to 1.0.30001788
- Updated `baseline-browser-mapping` to latest
- Upgraded `jest-environment-jsdom` to 30.3.0

### Fixed / 修复

- 7 npm security vulnerabilities resolved

[View details](./archive/v1.3.0.md)

---

## [v1.2.1] - 2026-04-15

### Added / 新增

- 14 new i18n keys for achievements
- `__tests__/helpers.test.js` with 7 test cases
- Package metadata in package.json

### Changed / 变更

- Extracted `showModal`/`hideModal` helper functions
- Extracted `buildDeckItems` function

### Fixed / 修复

- `.gitattributes` invalid syntax
- `.gitignore` contradiction
- Empty catch block in `importDataFromObj`

[View details](./archive/v1.2.1.md)

---

## [v1.2.0] - 2026-04-06

### Added / 新增

- `src/stats.js` - Statistics logic module
- `src/achievements.js` - Achievement system module
- `src/modes.js` - Training modes logic module
- `src/import-export.js` - Data normalization module
- 5 new test files

### Changed / 变更

- Refactored storage with normalization
- Timer now uses timestamp-based calculation
- Improved accessibility with ARIA attributes

[View details](./archive/v1.2.0.md)

---

## [v1.1.0] - 2026-03-10

### Changed / 变更

- Renamed `deploy.yml` to `pages.yml`
- Unified CI permissions and concurrency
- Added path filtering to reduce unnecessary builds

[View details](./archive/v1.1.0.md)

---

## [v1.0.0] - 2025-12-19

### Added / 新增

- 10 UMD modules in `src/` directory
- Modular architecture for better testability

### Changed / 变更

- Extracted DOM bindings to `src/ui.js`
- Extracted event handlers to `src/ui-events.js`

[View details](./archive/v1.0.0.md)

---

## [v0.2.0] - 2025-12-18

### Added / 新增

- MIT License
- PWA icon (`assets/icon.svg`)
- Documentation skeleton in `docs/`

### Fixed / 修复

- Service Worker CDN cache deletion issue
- Tailwind CDN initialization order

[View details](./archive/v0.2.0.md)

---

## [v0.1.0] - 2025-02-13

### Added / 新增

- `.editorconfig` for code style consistency
- Standard badges in README

[View details](./archive/v0.1.0.md)

---

[Unreleased]: https://github.com/vibe-knight/mind-gym/compare/v1.11.1...HEAD
[v1.11.1]: https://github.com/vibe-knight/mind-gym/compare/v1.11.0...v1.11.1
[v1.11.0]: https://github.com/vibe-knight/mind-gym/compare/v1.10.0...v1.11.0
[v1.10.0]: https://github.com/vibe-knight/mind-gym/compare/v1.9.0...v1.10.0
[v1.9.0]: https://github.com/vibe-knight/mind-gym/compare/v1.8.0...v1.9.0
[v1.8.0]: https://github.com/vibe-knight/mind-gym/compare/v1.6.1...v1.8.0
[v1.6.1]: https://github.com/vibe-knight/mind-gym/compare/v1.6.0...v1.6.1
[v1.6.0]: https://github.com/vibe-knight/mind-gym/compare/v1.5.0...v1.6.0
[v1.5.0]: https://github.com/vibe-knight/mind-gym/compare/v1.4.0...v1.5.0
[v1.4.0]: https://github.com/vibe-knight/mind-gym/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/vibe-knight/mind-gym/compare/v1.2.1...v1.3.0
[v1.2.1]: https://github.com/vibe-knight/mind-gym/compare/v1.2.0...v1.2.1
[v1.2.0]: https://github.com/vibe-knight/mind-gym/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/vibe-knight/mind-gym/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/vibe-knight/mind-gym/compare/v0.2.0...v1.0.0
[v0.2.0]: https://github.com/vibe-knight/mind-gym/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/vibe-knight/mind-gym/releases/tag/v0.1.0
