const path = require('path');

module.exports = {
  displayName: 'tsc',
  rootDir: path.join(__dirname, '..'),
  runner: 'jest-runner-tsc',
  testPathIgnorePatterns: ['node_modules', 'dist'],
  testMatch: ['<rootDir>/**/*.+(ts|tsx)'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
};
