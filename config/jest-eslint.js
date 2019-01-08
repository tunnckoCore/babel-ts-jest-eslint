const path = require('path');

module.exports = {
  displayName: 'lint',
  rootDir: path.join(__dirname, '..'),
  runner: 'jest-runner-eslint',
  // testPathIgnorePatterns: ['node_modules', 'dist'],
  testMatch: ['<rootDir>/**/*.+(ts|tsx)'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
};
