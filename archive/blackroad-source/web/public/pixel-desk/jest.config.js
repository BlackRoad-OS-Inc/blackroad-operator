module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!__tests__/**',
    '!__mocks__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 30,
      statements: 30
    }
  },
  forceExit: true,
  moduleNameMapper: {
    '^electron$': '<rootDir>/__mocks__/electron.js'
  },
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  verbose: true
};
