# Internationalization (i18n)

> Multi-language support with runtime switching

## Purpose

Mind Gym supports English and Chinese with automatic language detection and runtime switching without page reload.

---

## Interfaces

### Language

```typescript
type Language = 'auto' | 'zh' | 'en';
```

### I18nModule

```typescript
interface I18nModule {
  getLang: () => Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  tf: (key: string, vars: Record<string, any>) => string;
  autoDetect: () => void;
  applyToDOM: () => void;
}
```

---

## Requirements

### REQ-I18N-001: Language Detection

The system SHALL auto-detect browser language on first visit.

#### Scenario: Chinese browser

- **WHEN** browser language is zh or zh-CN
- **THEN** interface displays in Chinese

#### Scenario: English browser

- **WHEN** browser language is en or other
- **THEN** interface displays in English

#### Scenario: User override

- **WHEN** user sets language in settings
- **THEN** override takes precedence

### REQ-I18N-002: Runtime Switching

The system SHALL allow language switching without page reload.

#### Scenario: Switch language

- **WHEN** user changes language setting
- **THEN** DOM updates immediately
- **AND** setting is persisted

### REQ-I18N-003: Key Fallback

The system SHALL return key name when translation missing.

#### Scenario: Missing key

- **WHEN** translation key not found
- **THEN** key name returned as fallback

### REQ-I18N-004: Interpolation

The system SHALL support variable interpolation.

#### Scenario: Interpolate variables

- **WHEN** tf('stats_games', { count: 42 }) called
- **THEN** "Games: 42" returned

---

## Dictionary Structure

```javascript
const DICT = {
  en: {
    settings_title: 'Settings',
    settings_sound: 'Sound Effects',
    game_new: 'New Game',
    game_pause: 'Pause',
    // ...
  },
  zh: {
    settings_title: '设置',
    settings_sound: '音效',
    game_new: '新游戏',
    game_pause: '暂停',
    // ...
  },
};
```

### Key Naming Convention

```
<category>_<item>_<variant>
```

Examples:

- `settings_title` — Settings category, title item
- `game_new` — Game category, new game action
- `achievement_first_win` — Achievement category

---

## DOM Translation

### Attributes

| Attribute               | Usage            |
| ----------------------- | ---------------- |
| `data-i18n`             | Text content     |
| `data-i18n-placeholder` | Placeholder text |
| `data-i18n-title`       | Title tooltip    |

### Implementation

```javascript
function applyToDOM() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
}
```

### HTML Usage

```html
<button data-i18n="game_new">New Game</button>
<input data-i18n-placeholder="search_placeholder" />
<span data-i18n-title="help_tooltip">?</span>
```

---

## Acceptance Criteria

| ID          | Criterion                    | Status | Verified   |
| ----------- | ---------------------------- | ------ | ---------- |
| AC-I18N-001 | Auto-detect browser language | DONE   | 2026-04-17 |
| AC-I18N-002 | Support zh and en            | DONE   | 2026-04-17 |
| AC-I18N-003 | Runtime language switching   | DONE   | 2026-04-17 |
| AC-I18N-004 | Fallback to key name         | DONE   | 2026-04-17 |
| AC-I18N-005 | Variable interpolation       | DONE   | 2026-04-17 |
| AC-I18N-006 | DOM attributes supported     | DONE   | 2026-04-17 |

---

## Supported Languages

| Code | Language             | Native Name |
| ---- | -------------------- | ----------- |
| `en` | English              | English     |
| `zh` | Chinese (Simplified) | 简体中文    |

---

## File Organization

```
src/i18n.js
├── DICT object
│   ├── en: { ... }
│   └── zh: { ... }
├── currentLang variable
├── autoDetect()
├── setLang()
├── t()
├── tf()
└── applyToDOM()
```

---

## Future Considerations

| Priority | Feature                | Description                  |
| -------- | ---------------------- | ---------------------------- |
| P2       | Pluralization          | Handle singular/plural forms |
| P3       | More languages         | Japanese, Korean, etc.       |
| P4       | RTL support            | Right-to-left languages      |
| P5       | Date/number formatting | Locale-specific formatting   |

---

## References

- [Core Architecture](../../rfc/0001-core-architecture.md)
- [Data Layer](../data-layer/spec.md)
