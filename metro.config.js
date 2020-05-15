module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    getTransformOptions: () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
