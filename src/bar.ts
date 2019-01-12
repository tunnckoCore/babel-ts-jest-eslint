// import fs from 'fs-extra';
// import fastGlob from 'fast-glob';

// // class GlobStateCache {
// //   async load(stateFile) {
// //     let state = null;
// //     if (fs.existsSync(stateFile)) {
// //       const rawState = await fs.readFile(stateFile);
// //       state = JSON.parse(rawState);
// //     } else {
// //       await fs.writeFile(stateFile, '{}');
// //       state = {};
// //     }
// //     this.state = state;
// //   }

// //   async monitor(patterns) {
// //     await fastGlob(patterns, {
// //       ignore: ['**/node_modules/**'],
// //       transform: async (fp) => {
// //         const file = { path: fp };

// //         file.contents = fs.readFile(file.path, 'utf8');
// //       },
// //     });
// //   }
// // }

// async function main() {
//   await fastGlob('.', {
//     ignore: ['**/node_modules/**'],
//     transform: async (fp) => {
//       const file = { path: fp, contents: await fs.readFile(fp, 'utf8') };
//       console.log(file);
//       return file;
//     },
//   });
// }

// main();
