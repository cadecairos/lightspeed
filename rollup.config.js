import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/js/background.js',
  output: {
    file: 'src/dist/background.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
