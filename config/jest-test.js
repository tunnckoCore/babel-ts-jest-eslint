const path = require('path');

module.exports = {
  displayName: 'test',
  rootDir: path.join(__dirname, '..'),
  // testPathIgnorePatterns: ['node_modules', 'dist'],
  testMatch: ['<rootDir>/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
};
