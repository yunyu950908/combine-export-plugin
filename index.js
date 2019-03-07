const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PLUGIN_NAME = 'CombineExportPlugin';

class CombineExportPlugin {

  constructor(options) {
    this.PATH = {};
    this.init(options);
  }

  init(options) {
    const { basePath = '', targetName = '', patterns = {} } = options;
    const { include = '**/**.js', exclude = '' } = patterns;
    this.PATH.BASE = basePath;
    this.PATH.TARGET = path.resolve(this.PATH.BASE, targetName);
    this.PATH.SOURCE = glob.sync(path.resolve(this.PATH.BASE, include), { ignore: [this.PATH.TARGET, exclude] });
    this.checkPath();
  }

  apply(compiler) {
    compiler.hooks.entryOption.tap(PLUGIN_NAME, () => {
      // console.log(`@entry-option\tUpdating ${this.targetName}`);
      this.updateTarget();
    });
    compiler.hooks.invalid.tap(PLUGIN_NAME, (options) => {
      // console.log(`@invalid\tUpdating ${this.targetName}`);
      this.updateTarget();
    });
  }

  checkPath() {
    const checkHelper = filePath => fs.accessSync(
      filePath,
      fs.constants.F_OK | fs.constants.W_OK | fs.constants.R_OK,
    );

    try {
      checkHelper(this.PATH.BASE);
    } catch (e) {
      throw new Error(`
      basePath not exist,
      or basePath is not visible to the calling process,
      or process does not have read and write access to basePath.
      `);
    }

    try {
      checkHelper(this.PATH.TARGET);
    } catch (e) {
      this.writeFileFromString();
    }
  }

  updateTarget() {
    const oldContent = this.readFileToString();
    const newContent = this.generateOutput();
    if (oldContent !== newContent) {
      this.writeFileFromString(newContent);
    }
  }

  readFileToString() {
    const buf = fs.readFileSync(this.PATH.TARGET);
    const content = buf.toString();
    return content;
  }

  writeFileFromString(data = '') {
    fs.writeFileSync(this.PATH.TARGET, data);
  }

  generateOutput() {
    let output = '';
    this.PATH.SOURCE.forEach(filePath => {
      // dce-monitor/frontend/monitor/src/models/api/xxx.js => xxx.js
      // dce-monitor/frontend/monitor/src/models/api/a/b/c.js => a/b/c.js
      filePath = filePath.replace(new RegExp(this.PATH.BASE + '/?'), '');
      output += `export * from './${filePath}';\n`;
    });
    return output;
  }
}

module.exports = CombineExportPlugin;
