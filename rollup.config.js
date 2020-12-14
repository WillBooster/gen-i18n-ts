import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import externals from 'rollup-plugin-node-externals';

const extensions = ['.mjs', '.js', '.json', '.ts'];
const plugins = [
  externals({ deps: true }),
  resolve({ extensions }),
  commonjs(),
  babel({ extensions, babelHelpers: 'bundled', exclude: 'node_modules/**' }),
];

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
};
