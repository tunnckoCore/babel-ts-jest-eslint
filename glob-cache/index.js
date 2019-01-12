const fs = require('fs-extra');
const crypto = require('crypto');
const fastGlob = require('fast-glob');

/* eslint-disable class-methods-use-this */

module.exports = class GlobStateCache {
  constructor() {
    this.loadedFiles = null;
    this.changedFiles = {};
  }

  async loadCache(stateFile) {
    this.stateFile = stateFile;

    if (fs.existsSync(this.stateFile)) {
      this.loadedFiles = await fs.readJson(this.stateFile);
    }

    return this;
  }

  // allow passing option for maintaining clean state?
  // now it can be called "dirty" because
  // it never cleans up after, for example, (re)moving a file from the system
  // the entry for this file stays, which is very aggresive but why not?
  async monitor(patterns, options) {
    const opts = Object.assign(
      { ignore: ['**/{node_modules,coverage,dist}/**'] },
      options,
      { onlyFiles: true, absolute: true },
    );

    // compare(oldFileFromCache: object, newFile: object): boolean
    let { shouldChange, onChange } = opts;
    shouldChange =
      typeof shouldChange === 'function'
        ? shouldChange
        : (oldFile, file) => {
            const differentSize = file.stat.size !== oldFile.stat.size;
            const differentContents = file.contentHash !== oldFile.contentHash;
            const modifiedTime = file.stat.mtimeMs !== oldFile.stat.mtimeMs;

            return differentSize && differentContents && modifiedTime;
          };

    onChange = typeof onChange === 'function' ? onChange : () => {};

    const filepaths = await fastGlob(patterns, opts);

    /* eslint-disable no-restricted-syntax, no-await-in-loop */

    if (!this.loadedFiles) {
      for (const filepath of filepaths) {
        const file = await this.createFile(filepath);
        this.changedFiles[file.path] = file;
      }

      return this.changedFiles;
    }

    for (const filepath of filepaths) {
      const loadedFile = this.loadedFiles[filepath];
      const file = await this.createFile(filepath);

      if (loadedFile) {
        if (shouldChange(loadedFile, file)) {
          onChange(loadedFile, file);
          this.changedFiles[file.path] = file;
        }
      } else {
        this.changedFiles[file.path] = file;
      }
    }

    return this.changedFiles;
  }

  async writeCache(changed) {
    const state = Object.assign(
      {},
      this.loadedFiles,
      this.changedFiles,
      changed,
    );

    await fs.outputJson(this.stateFile, state);
  }

  async createFile(file) {
    const res = {};
    let stat = null;

    if (file && typeof file === 'object') {
      stat = file.stat || (await fs.lstat(file.path));
      res.path = file.path;
      res.contents = file.contents || (await fs.readFile(file.path, 'utf8'));
    } else {
      stat = await fs.lstat(file);
      res.path = file;
      res.contents = await fs.readFile(file, 'utf8');
    }

    res.contentHash = crypto
      .createHash('sha256')
      .update(res.contents)
      .digest('hex');

    res.stat = Object.keys(stat).reduce((acc, key) => {
      // all (including `atimeMs`, `mtimeMs` and `ctimeMs`)
      // but except the Date objects like `atime`, `mtime` and `ctime`
      if (!key.endsWith('time')) {
        acc[key] = stat[key];
      }
      return acc;
    }, {});

    return res;
  }
};
