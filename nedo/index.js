'use strict';

/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax, no-await-in-loop */

const path = require('path');
const proc = require('process');
const babel = require('@babel/core');
const fs = require('fs-extra');
const Glob = require('../glob-cache/index');
const linter = require('./eslint');
const { CACHE_FILE, CWD, PROJ, normalizePatterns } = require('./utils');

module.exports = (argv) => {
  // const POSSIBLE_ERROR_PATH = path.join(PROJ, 'last_error');

  // if (fs.existsSync(POSSIBLE_ERROR_PATH)) {
  //   console.error(fs.readFileSync(POSSIBLE_ERROR_PATH, 'utf8'));
  //   proc.exit(1);
  // }

  if (argv.reload && fs.existsSync(CACHE_FILE)) {
    fs.removeSync(CACHE_FILE);
  }

  if (argv['delete-dir-on-start']) {
    fs.removeSync(argv['out-dir'] || path.join(PROJ, 'dist'));
  }

  async function toPromise(patterns, options) {
    const globState = new Glob();

    await globState.loadCache(CACHE_FILE);

    const changedFiles = await globState.monitor(patterns, options);
    await globState.writeCache();

    return new Promise((resolve) => resolve(changedFiles));
  }

  return toPromise(normalizePatterns(argv), { cwd: CWD }).then(
    async (changedFiles) => {
      const files = Object.keys(changedFiles);
      // const report = lintFiles(files, argv);

      // if (report && report.errorCount > 0) {
      //   console.error(report.output);
      //   proc.exit(1);
      //   return;
      // }

      if (argv.lint) {
        const messages = [];

        for (const filename of files) {
          const file = changedFiles[filename];
          const report = linter(file.contents, file.path);
          if (report && report.errorCount > 0) {
            messages.push(report.output);
          }
        }

        if (messages.length > 0) {
          messages.map((msg) => console.error(msg));
          proc.exit(1);
          return;
        }
      }

      for (const filename of files) {
        const { code } = await babel.transformFileAsync(filename);

        // handle `src` as special case
        const relative = path.relative(CWD, filename);
        let relPath = relative.replace('src', 'dist');
        relPath = relPath.includes('dist')
          ? path.relative('dist', relPath)
          : relPath;

        const distPath = argv['out-dir']
          ? path.join(CWD, argv['out-dir'], relPath)
          : path.join(PROJ, 'dist', relPath);

        if (argv['out-dir']) {
          const parsed = path.parse(distPath);
          const output = path.format({
            dir: parsed.dir,
            name: parsed.name,
            ext: '.js',
          });

          console.log(relative, '->', path.relative(CWD, output));
          await fs.outputFile(output, code);
        } else {
          console.log(code);
        }
      }
    },
  );
};
