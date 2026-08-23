module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', 'app.js'],
  // 覆盖率阈值统一生效（本地与 CI 相同），当前基线见 CHANGELOG
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 55,
      lines: 50,
      statements: 50,
    },
  },
};
