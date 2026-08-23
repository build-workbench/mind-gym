const globals = require('globals');

// UMD 浏览器全局：各模块通过 <script> 标签顺序暴露
const umdGlobals = {
  RememberKeys: 'readonly',
  RememberUtils: 'readonly',
  RememberShared: 'readonly',
  RememberStats: 'readonly',
  RememberAchievements: 'readonly',
  RememberModes: 'readonly',
  RememberImportExport: 'readonly',
  RememberStorage: 'readonly',
  RememberSettingsDefaults: 'readonly',
  RememberSettings: 'readonly',
  RememberI18n: 'readonly',
  RememberEffects: 'readonly',
  RememberPools: 'readonly',
  RememberTimer: 'readonly',
  RememberConfetti: 'readonly',
  RememberUIEvents: 'readonly',
  RememberUI: 'readonly',
  RememberUIRenderer: 'readonly',
  RememberWinPipeline: 'readonly',
  RememberFSRS: 'readonly',
  RememberGameManager: 'readonly',
  RememberModalManager: 'readonly',
  RememberGameState: 'readonly',
  RememberRecall: 'readonly',
  RememberDaily: 'readonly',
};

const nodeGlobals = {
  require: 'readonly',
  module: 'writable',
  process: 'readonly',
  __dirname: 'readonly',
};

// UMD 模块的 CommonJS 分支（typeof module !== 'undefined' && module.exports）
const cjsGlobals = {
  module: 'writable',
  require: 'readonly',
};

module.exports = [
  {
    ignores: ['dist/', 'coverage/', 'assets/', 'node_modules/'],
  },
  {
    files: ['app.js', 'sw.js', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...cjsGlobals,
        ...umdGlobals,
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
  {
    // sw.js 运行在 Service Worker 全局
    files: ['sw.js'],
    languageOptions: {
      globals: { ...globals.serviceworker },
    },
  },
  {
    files: ['__tests__/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.jest,
        global: 'readonly',
        ...nodeGlobals,
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**', '*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    },
  },
];
