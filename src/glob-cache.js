import fs from 'fs-extra';
import crypto from 'crypto';
import fastGlob from 'fast-glob';

/* eslint-disable class-methods-use-this */

class GlobStateCache {
  constructor() {
    this.loadedFiles = null;
    this.changedFiles = {};
  }

  async loadCache(stateFile) {
    this.stateFile = stateFile;

    if (fs.existsSync(this.stateFile)) {
      const rawState = await fs.readFile(this.stateFile, 'utf8');

      this.loadedFiles = JSON.parse(rawState);
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
    shouldChange = typeof shouldChange === 'function' ? shouldChange : () => {};
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
        const differentSize = file.stat.size !== loadedFile.stat.size;
        const differentContents = file.contentHash !== loadedFile.contentHash;
        const modifiedTime = file.stat.mtimeMs !== loadedFile.stat.mtimeMs;
        const isChanged = differentSize && differentContents && modifiedTime;

        if (shouldChange(loadedFile, file) || isChanged) {
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

    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
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
}

async function main(patterns, options) {
  const globState = new GlobStateCache();

  await globState.loadCache('./file-cache.json');
  await globState.monitor(patterns, options);
  await globState.writeCache();

  return globState;
}

let i = 0;
main(['src/**/*.{js,ts,tsx}', '!src/**/*.test.{ts,tsx}'], {
  onChange: (old, file) => {
    i++;
    console.log(i);
  },
});
