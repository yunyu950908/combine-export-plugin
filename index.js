const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PLUGIN_NAME = 'CombineExportPlugin';

class CombineExportPlugin {

  constructor(options) {
    this.path = {
      base: '',
      target: '',
      source: [],
    };
    this.init(options);
  }

  init(options) {
    const { basePath = '', targetName = '', patterns = {} } = options;
    const targetPath = path.resolve(basePath, targetName);
    this.checkPath(basePath, targetPath);
    this.path.base = basePath;
    this.path.target = targetPath;
    this.path.source = this.getSrcPaths(patterns);
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

  getSrcPaths(patterns) {
    const result = [];
    const { includes = ['**/**.js'], excludes = [] } = patterns;
    const getPattern = p => path.resolve(this.path.base, p);
    const ignore = [this.path.target, ...excludes];
    includes.forEach(p => {
      const ps = glob.sync(getPattern(p), { ignore });
      result.push(...ps);
    });
    return result;
  }

  checkPath(basePath, targetPath) {
    const checkHelper = filePath => fs.accessSync(
      filePath,
      fs.constants.F_OK | fs.constants.W_OK | fs.constants.R_OK,
    );

    if (!path.isAbsolute(basePath)) {
      throw new Error('`basePath` need to be an absolute path.')
    }

    try {
      checkHelper(basePath);
    } catch (e) {
      throw new Error(`
      basePath not exist,
      or basePath is not visible to the calling process,
      or process does not have read and write access to basePath.
      `);
    }

    try {
      checkHelper(targetPath);
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
    const buf = fs.readFileSync(this.path.target);
    const content = buf.toString();
    return content;
  }

  writeFileFromString(data = '') {
    fs.writeFileSync(this.path.target, data);
  }

  generateOutput() {
    let output = '';
    this.path.source.forEach(filePath => {
      filePath = filePath.replace(new RegExp(this.path.base + '/?'), '');
      output += `export * from './${filePath}';\n`;
    });
    return output;
  }
}

module.exports = CombineExportPlugin;
