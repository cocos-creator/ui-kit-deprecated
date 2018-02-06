'use strict';

const fsJetpack = require('fs-jetpack');
const pjson = require('../package.json');
const resolve = require('@gamedev-js/rollup-plugin-node-resolve');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');

let banner = `
/*
 * ${pjson.name} v${pjson.version}
 * (c) ${new Date().getFullYear()} @cocos
 * Released under the MIT License.
 */
`;

let dest = './dist';
let file = 'ui-kit';
let name = 'uikit';
let sourcemap = true;
let globals = {
  'engine-3d': 'cc'
};

// clear directory
fsJetpack.dir(dest, { empty: true });

module.exports = {
  input: './index.js',
  external: [
    'engine-3d'
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      root: process.cwd()
    }),
    commonjs(),
    buble(),
  ],
  output: [
    {
      file: `${dest}/${file}.dev.js`,
      format: 'iife',
      name,
      banner,
      globals,
      sourcemap,
    },
    {
      file: `${dest}/${file}.js`,
      format: 'cjs',
      name,
      banner,
      globals,
      sourcemap,
    },
  ],
};
