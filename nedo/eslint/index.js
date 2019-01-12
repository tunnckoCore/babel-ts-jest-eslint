'use strict';

/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax, no-await-in-loop */

const path = require('path');
const eslint = require('eslint');
const { PROJ, arrayify } = require('../utils');

module.exports = function linter(text, opts = {}) {
  const defaultOptions = {
    fix: true,
    cache: true,
    cacheLocation: path.join(PROJ, 'eslint-cache'),
  };

  const options = { ...opts, ...defaultOptions };
  options.extensions = arrayify(options.extensions);

  const engine = new eslint.CLIEngine(options);
  const report = engine.executeOnText(text, options.filename);
  report.format = engine.getFormatter('codeframe');

  eslint.CLIEngine.outputFixes(report);

  if (report.errorCount === 0 && report.warningCount === 0) {
    return null;
  }

  report.output = options.warnings
    ? report.format(report.results)
    : report.format(eslint.CLIEngine.getErrorResults(report.results));

  if (report.output.length > 0) {
    console.error(report.output);
  }

  return report;
};
