import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve';

export default [{
  input: 'src/js/background.js',
  output: {
    file: 'dist/js/background.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
}, {
  input: 'src/js/popup.js',
  output: {
    file: 'dist/js/popup.js',
    format: 'iife'
  }
}];
