# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For detailed changelogs, see the [changelog/](./changelog/) directory.

## [v1.6.0] - 2026-04-16

### Added

- `.github/workflows/dependency-review.yml` for dependency auditing
- Issue templates: bug_report, feature_request, documentation
- Enhanced Service Worker with message handling and sync support
- Build verification steps in CI workflow
- Coverage report upload in CI

### Changed

- Optimized pages.yml with timeouts, caching, and dist verification
- Split ci.yml into lint, test, build jobs with ci-passed summary
- Enhanced pr-title.yml with auto-labeling
- Improved manifest.webmanifest with shortcuts and metadata
- Updated pull_request_template.md with emojis and expanded scopes

[View details](./changelog/2026-04-16_workflow-enhancement.md)

## [v1.5.0] - 2026-04-16

### Added

- Root `CHANGELOG.md` with complete version history
- `changelog/README.md` with version table and writing guidelines
- Changelog writing template and naming convention

### Changed

- Unified all changelog file naming: `YYYY-MM-DD_short-title.md`
- Standardized changelog format with version numbers
- Added tables for structured data in all changelog files

### Removed

- Deprecated old changelog files with inconsistent naming

[View details](./changelog/2026-04-16_changelog-system.md)

## [v1.4.0] - 2026-04-16

### Added

- Comprehensive documentation refactor across all files
- ASCII architecture diagram in docs/architecture.md
- TypeScript type definitions in docs/storage.md
- Keyboard shortcuts tables in README files
- Data storage tables in README files
- Code examples throughout documentation

### Changed

- Unified documentation style with tables and code blocks
- Improved CONTRIBUTING.md with detailed guidelines
- Enhanced CLAUDE.md with complete module loading order

[View details](./changelog/2026-04-16_documentation-refactor.md)

## [v1.3.0] - 2026-04-16

### Changed

- Formatted all code with Prettier (31 files)
- Updated `caniuse-lite` to 1.0.30001788
- Updated `baseline-browser-mapping` to latest
- Upgraded `jest-environment-jsdom` to 30.3.0

### Fixed

- 7 npm security vulnerabilities resolved

[View details](./changelog/2026-04-16_code-formatting.md)

## [v1.2.1] - 2026-07-15

### Added

- 14 new i18n keys for achievements
- `__tests__/helpers.test.js` with 7 test cases
- Package metadata in package.json

### Changed

- Extracted `showModal`/`hideModal` helper functions
- Extracted `buildDeckItems` function

### Fixed

- `.gitattributes` invalid syntax
- `.gitignore` contradiction
- Empty catch block in `importDataFromObj`

[View details](./changelog/2026-07-15_code-optimization.md)

## [v1.2.0] - 2026-04-06

### Added

- `src/stats.js` - Statistics logic module
- `src/achievements.js` - Achievement system module
- `src/modes.js` - Training modes logic module
- `src/import-export.js` - Data normalization module
- 5 new test files

### Changed

- Refactored storage with normalization
- Timer now uses timestamp-based calculation
- Improved accessibility with ARIA attributes

[View details](./changelog/2026-04-06_quality-and-hardening.md)

## [v1.1.0] - 2026-03-10

### Changed

- Renamed `deploy.yml` to `pages.yml`
- Unified CI permissions and concurrency
- Added path filtering to reduce unnecessary builds

[View details](./changelog/2026-03-10_workflow-standardization.md)

## [v1.0.0] - 2025-12-19

### Added

- 10 UMD modules in `src/` directory
- Modular architecture for better testability

### Changed

- Extracted DOM bindings to `src/ui.js`
- Extracted event handlers to `src/ui-events.js`

[View details](./changelog/2025-12-19_modular-refactor.md)

## [v0.2.0] - 2025-12-18

### Added

- MIT License
- PWA icon (`assets/icon.svg`)
- Documentation skeleton in `docs/`

### Fixed

- Service Worker CDN cache deletion issue
- Tailwind CDN initialization order

[View details](./changelog/2025-12-18_docs-and-pwa.md)

## [v0.1.0] - 2025-02-13

### Added

- `.editorconfig` for code style consistency
- Standard badges in README

[View details](./changelog/2025-02-13_project-infrastructure.md)

---

[Unreleased]: https://github.com/LessUp/mind-gym/compare/v1.6.0...HEAD
[v1.6.0]: https://github.com/LessUp/mind-gym/compare/v1.5.0...v1.6.0
[v1.5.0]: https://github.com/LessUp/mind-gym/compare/v1.4.0...v1.5.0
[v1.4.0]: https://github.com/LessUp/mind-gym/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/LessUp/mind-gym/compare/v1.2.1...v1.3.0
[v1.2.1]: https://github.com/LessUp/mind-gym/compare/v1.2.0...v1.2.1
[v1.2.0]: https://github.com/LessUp/mind-gym/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/LessUp/mind-gym/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/LessUp/mind-gym/compare/v0.2.0...v1.0.0
[v0.2.0]: https://github.com/LessUp/mind-gym/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/LessUp/mind-gym/releases/tag/v0.1.0
