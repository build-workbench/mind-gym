---
openspec:
  type: rfc
  status: accepted
  created: 2025-12-19
  updated: 2026-04-17
---

# RFC-0002: Internationalization (i18n) Strategy

| Status  | Accepted   |
| ------- | ---------- |
| Created | 2025-12-19 |
| Updated | 2026-04-17 |

## Summary

This RFC defines the internationalization strategy for Mind Gym, supporting English and Chinese with automatic language detection and runtime switching.

## Motivation

1. Support global users with different language preferences
2. Provide seamless language switching without page reload
3. Maintain simple implementation without external i18n libraries

## Language Support

### Supported Languages

| Code | Language             | Native Name |
| ---- | -------------------- | ----------- |
| `en` | English              | English     |
| `zh` | Chinese (Simplified) | 简体中文    |

### Default Behavior

- Auto-detect browser language
- Fall back to English if unsupported language detected
- User can override auto-detection in settings

## Architecture

### Dictionary Structure

```javascript
// src/i18n.js
const DICT = {
  en: {
    // Keys are organized by category
    settings_title: 'Settings',
    settings_sound: 'Sound Effects',
    settings_vibrate: 'Vibration',
    // ...
    game_new: 'New Game',
    game_pause: 'Pause',
    game_hint: 'Hint',
    // ...
  },
  zh: {
    settings_title: '设置',
    settings_sound: '音效',
    settings_vibrate: '震动',
    // ...
    game_new: '新游戏',
    game_pause: '暂停',
    game_hint: '提示',
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
- `mode_nback` — Mode category, N-back mode
- `achievement_first_win` — Achievement category, first win

### Module Interface

```javascript
// src/i18n.js
window.RememberI18n = {
  // Get current language code
  getLang: () => currentLang,

  // Set language
  setLang: (lang) => { ... },

  // Get translation for key
  t: (key) => DICT[currentLang][key] || key,

  // Get translation with interpolation
  tf: (key, vars) => { ... },

  // Auto-detect and apply language
  autoDetect: () => { ... },

  // Apply translations to DOM
  applyToDOM: () => { ... }
};
```

## Implementation

### Language Detection

```javascript
function autoDetectLanguage() {
  const stored = localStorage.getItem('memory_match_settings');
  if (stored) {
    const settings = JSON.parse(stored);
    if (settings.language && settings.language !== 'auto') {
      return settings.language;
    }
  }

  // Browser detection
  const browserLang = navigator.language || navigator.userLanguage;
  const primaryLang = browserLang.split('-')[0].toLowerCase();

  if (primaryLang === 'zh') return 'zh';
  return 'en';
}
```

### DOM Translation

```javascript
function applyToDOM() {
  // Elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Elements with data-i18n-placeholder attribute
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Elements with data-i18n-title attribute
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });
}
```

### HTML Usage

```html
<!-- Text content -->
<button data-i18n="game_new">New Game</button>

<!-- Placeholder -->
<input data-i18n-placeholder="search_placeholder" placeholder="Search..." />

<!-- Title tooltip -->
<span data-i18n-title="help_tooltip" title="Help">?</span>
```

## Settings Integration

### Language Settings

```typescript
interface Settings {
  // ... other settings
  language: 'auto' | 'zh' | 'en';
}
```

### Language Selector UI

- Dropdown with options: Auto, English, 中文
- Changes apply immediately without reload
- Stored in localStorage

## Best Practices

### Adding New Keys

1. Add to both `en` and `zh` dictionaries
2. Use descriptive key names
3. Group by feature category
4. Document context in comments

```javascript
const DICT = {
  en: {
    // Achievement: First win
    achievement_first_win: 'First Victory',
    achievement_first_win_desc: 'Complete your first game',
  },
  zh: {
    achievement_first_win: '初次胜利',
    achievement_first_win_desc: '完成第一局游戏',
  },
};
```

### Interpolation

For dynamic text with variables:

```javascript
// Dictionary
en: {
  stats_games_played: 'Games Played: {count}',
}

// Usage
tf('stats_games_played', { count: 42 });
// Output: "Games Played: 42"
```

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

## Testing

### Test Cases

| Scenario                    | Expected Behavior            |
| --------------------------- | ---------------------------- |
| Auto-detect with zh browser | Language set to zh           |
| Auto-detect with en browser | Language set to en           |
| User sets language          | Override auto-detection      |
| Missing translation key     | Return key name as fallback  |
| Switch language             | DOM updates immediately      |
| Interpolation               | Variables replaced correctly |

## Future Considerations

### Potential Additions

| Priority | Feature                | Description                    |
| -------- | ---------------------- | ------------------------------ |
| P2       | Pluralization          | Handle singular/plural forms   |
| P3       | More languages         | Add Japanese, Korean, etc.     |
| P4       | RTL support            | Right-to-left language support |
| P5       | Date/number formatting | Locale-specific formatting     |

### Pluralization (Future)

```javascript
// Future implementation
en: {
  items_count_one: '{count} item',
  items_count_other: '{count} items',
}

tf('items_count', { count: n }, n === 1 ? 'one' : 'other');
```

## References

- [Core Architecture](./0001-core-architecture.md)
- [Data Layer Specification](../specs/data-layer/spec.md)
