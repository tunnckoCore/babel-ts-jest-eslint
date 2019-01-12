'use strict';

module.exports = {
  // projects: ['<rootDir>/config/lint.js', '<rootDir>/config/typecheck.js'],
  displayName: 'test',
  rootDir: __dirname,
  // testPathIgnorePatterns: ['node_modules', 'dist'],
  testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/**/*.test.tsx'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
};
