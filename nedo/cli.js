#!/usr/env/node

/* eslint-disable import/no-extraneous-dependencies */

const proc = require('process');
const mri = require('mri');
const cli = require('./index');

// / sasa

const argv = mri(proc.argv.slice(2), {
  alias: {
    x: 'extensions',
    d: 'out-dir',
  },
  string: ['d'],
  default: {
    x: ['.ts', '.tsx'],
  },
});

cli(argv).catch(console.log);
