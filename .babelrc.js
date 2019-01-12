module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { targets: { esmodules: true }, modules: false, useBuiltIns: 'usage' },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  ignore: [
    // this sucks?
    // Damn Babel and jest, just support standard globbing and nothing more...
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
};
