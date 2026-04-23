# Legacy Specs Archive

> ⚠️ **This directory is preserved as a read-only archive.**

## Status

These specifications have been migrated to OpenSpec. The active source of truth is now in:

- **`../openspec/specs/`** — Capability specifications
- **`../openspec/rfc/`** — Architectural decision records

## Migration Map

| Legacy File                       | Migrated To                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| `product/classic-matching.md`     | `openspec/specs/game-modes/spec.md`                                  |
| `product/countdown-mode.md`       | `openspec/specs/game-modes/spec.md`                                  |
| `product/daily-challenge.md`      | `openspec/specs/game-modes/spec.md`                                  |
| `product/nback-training.md`       | `openspec/specs/game-modes/spec.md`                                  |
| `product/delayed-recall.md`       | `openspec/specs/game-modes/spec.md`                                  |
| `product/scoring-system.md`       | `openspec/specs/scoring/spec.md`                                     |
| `product/adaptive-system.md`      | `openspec/specs/adaptive-systems/spec.md`                            |
| `product/spaced-reinforcement.md` | `openspec/specs/adaptive-systems/spec.md`                            |
| `db/schema.md`                    | `openspec/specs/data-layer/spec.md`                                  |
| `db/storage-spec.md`              | `openspec/specs/data-layer/spec.md`                                  |
| `rfc/0001-core-architecture.md`   | `openspec/rfc/0001-core-architecture.md`                             |
| `rfc/0002-i18n-strategy.md`       | `openspec/rfc/0002-i18n-strategy.md` + `openspec/specs/i18n/spec.md` |
| `rfc/0003-pwa-offline.md`         | `openspec/rfc/0003-pwa-offline.md` + `openspec/specs/pwa/spec.md`    |

## Why This Archive Exists

- Preserves git history of original specs
- Allows rollback if needed
- Documents the migration process

## Do Not Edit

**Do not edit files in this directory.** All changes should go through the OpenSpec workflow:

```
/opsx:propose "your change description"
```
