'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const CWD = process.cwd();
const PROJ = path.join(os.homedir(), '.nedo', path.basename(CWD));
const CACHE_FILE = path.join(PROJ, 'file-state-cache.json');

function normalizedGlobs(argv) {
  return ['**/*', '!**/*.{test,d,spec}'].map((x) => {
    const exts = arrayify(argv.extensions)
      .map((ext) => (ext.startsWith('.') ? ext.slice(1) : ext))
      .join(',');

    return `${x}.{${exts}}`;
  });
}

function normalizePatterns(argv) {
  return argv._.length > 0
    ? argv._.reduce(normalize(argv), [])
    : normalizedGlobs(argv);
}

function arrayify(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

function normalize(argv) {
  return (acc, input) => {
    if (fs.lstatSync(input).isDirectory()) {
      return acc.concat(
        normalizedGlobs(argv).map((x) =>
          x.startsWith('!')
            ? path.join(`!${input}`, x.slice(1))
            : path.join(input, x),
        ),
      );
    }
    return acc.concat(input);
  };
}

module.exports = {
  CWD,
  PROJ,
  CACHE_FILE,
  normalizePatterns,
  arrayify,
  // append,
};
