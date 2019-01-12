import GlobStateCache from './index';

/**
 * All `patterns` and `options` are directly passed to `fast-glob`.
 *
 * @param {any} patterns
 * @param {any} options
 */
export default async function main(patterns, options) {
  const globState = new GlobStateCache();

  await globState.loadCache('./file-cache.json');

  // only the changed files
  // from the given glob patterns
  const changedFiles = await globState.monitor(patterns, options);
  console.log(changedFiles);
  console.log('Changed:', Object.keys(changedFiles).length);

  // later, write save the cache
  await globState.writeCache();

  return globState;
}

/**
 * Example
 */

main(['src/**/*.{js,ts,tsx}', '!src/**/*.test.{ts,tsx}'], {
  /**
   * Defaults to the following `opts.shouldChange` below
   *
   * @params {Object} oldFile - file from cache
   * @params {Object} file - current state of the file
   */
  // shouldChange: (oldFile, file) => {
  //   const differentSize = file.stat.size !== oldFile.stat.size;
  //   const differentContents = file.contentHash !== oldFile.contentHash;
  //   const modifiedTime = file.stat.mtimeMs !== oldFile.stat.mtimeMs;

  //   return differentSize && differentContents && modifiedTime;
  // },

  /**
   * Called when `opts.shouldChange` returns `true`
   *
   * @params {Object} oldFile - file from cache
   * @params {Object} file - current state of the file
   */
  onChange: (oldFile, file) => {
    console.log(oldFile.contentHash !== file.contentHash); // true
  },
});
