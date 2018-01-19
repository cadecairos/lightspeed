import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/js/FastTab.js',
  output: {
    file: 'src/dist/FastTab.js',
    format: 'iife'
  },
  plugins: [
    commonjs({
      namedExports: {
        "src/external/fuse.min.js": ['Fuse']
      }
    })
  ]
};
