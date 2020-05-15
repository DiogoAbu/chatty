const { generateTemplateFiles } = require('generate-template-files');

generateTemplateFiles([
  {
    option: 'Screen',
    defaultCase: '(pascalCase)',
    entry: {
      folderPath: './templates/screen/',
    },
    stringReplacers: ['__name__'],
    output: {
      path: './src/screens/__name__(pascalCase)',
    },
  },
  {
    option: 'Model',
    defaultCase: '(pascalCase)',
    entry: {
      folderPath: './templates/model/__name__Model.ts',
    },
    stringReplacers: ['__name__'],
    output: {
      path: './src/models/__name__(pascalCase)Model.ts',
    },
  },
]);
