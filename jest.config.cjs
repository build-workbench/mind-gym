module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', 'app.js'],
  coverageThreshold: process.env.CI
    ? {}
    : {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
};
