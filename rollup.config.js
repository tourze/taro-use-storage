import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const external = ['react', '@tarojs/taro', '@storybook/react-vite'];

// TypeScript 插件配置，排除 stories 文件
const typescriptOptions = {
  exclude: [
    'src/**/*.stories.*',
    'src/**/*.test.*',
    'src/**/*.spec.*',
    'node_modules/**'
  ]
};

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [typescript(typescriptOptions), resolve(), commonjs()],
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [typescript(typescriptOptions), resolve(), commonjs()],
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    external,
    plugins: [dts()],
  },
];