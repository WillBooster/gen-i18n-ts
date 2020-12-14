import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import closureCompile from '@ampproject/rollup-plugin-closure-compiler';

const extensions = ['.mjs', '.js', '.json', '.ts'];
const plugins = [
  resolve({ extensions }),
  commonjs(),
  babel({ extensions, babelHelpers: 'bundled', exclude: 'node_modules/**' }),
];
// if (process.env.NODE_ENV === 'production') {
//   plugins.push(closureCompile());
// }

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'commonjs',
      sourcemap: true,
    },
  ],
  plugins,
  external: ['lodash', 'yargs'],
};
