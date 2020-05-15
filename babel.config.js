module.exports = {
  presets: ['module:metro-react-native-babel-preset', 'mobx'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'transform-class-properties',
    [
      'module-resolver',
      {
        alias: {
          '!': './src',
        },
        cwd: 'babelrc',
        extensions: [
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
          '.ios.ts',
          '.ios.tsx',
          '.android.ts',
          '.android.tsx',
        ],
        root: ['./src'],
      },
    ],
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel', 'transform-remove-console'],
    },
  },
};
