# combine-export-plugin
[![combine-export-plugin](https://img.shields.io/npm/v/combine-export-plugin.svg?style=flat-square)](https://www.npmjs.com/package/combine-export-plugin)
[![NPM downloads](https://img.shields.io/npm/dt/combine-export-plugin.svg?style=flat-square)](https://npmjs.org/package/combine-export-plugin)

### A webpack plugin for combine export from multiple file

## Install
``` bash
npm install -D combine-export-plugin
```

## Usage
``` javascript
// webpack.config.js

const CombineExportPlugin = require('combine-export-plugin')
module.exports = {

  //...

  plugins: [
    new CombineExportPlugin({
      basePath: path.resolve(__dirname, '../src/api/'),
      targetName: 'index.js',
      patterns: {
        include: '**/**.js',
        exclude: '',
      }
    }),
  ]

  // ....

}
```
