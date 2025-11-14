import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

const external = [
  'react',
  '@tarojs/taro',
  '@tarojs/taro-h5',
  '@storybook/react-vite'
];

// TypeScript 插件配置，排除 stories 和测试文件
const typescriptOptions = {
  exclude: [
    'src/**/*.stories.*',
    'src/**/*.test.*',
    'src/**/*.spec.*',
    'src/**/*.d.ts',
    'node_modules/**'
  ],
  tsconfig: './tsconfig.json',
  declaration: false, // 单独生成类型文件
};

// 生产环境配置
const production = !process.env.ROLLUP_WATCH;

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      typescript(typescriptOptions),
      production && terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: production,
          drop_debugger: production,
          pure_funcs: production ? ['console.log', 'console.debug'] : [],
        },
        mangle: {
          safari10: true,
        },
      }),
    ].filter(Boolean),
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
    plugins: [
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      typescript(typescriptOptions),
      production && terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: production,
          drop_debugger: production,
          pure_funcs: production ? ['console.log', 'console.debug'] : [],
        },
        mangle: {
          safari10: true,
        },
      }),
    ].filter(Boolean),
  },
  // UMD build for browser
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'TaroUseStorage',
      sourcemap: true,
      globals: {
        react: 'React',
        '@tarojs/taro': 'Taro',
      },
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      typescript(typescriptOptions),
      production && terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: production,
          drop_debugger: production,
          pure_funcs: production ? ['console.log', 'console.debug'] : [],
        },
        mangle: {
          safari10: true,
        },
      }),
    ].filter(Boolean),
  },
  // Minified ES Module
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.min.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      typescript(typescriptOptions),
      terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug', 'console.info'],
        },
        mangle: {
          safari10: true,
        },
      }),
    ],
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    external,
    plugins: [
      dts({
        respectExternal: true,
        exclude: [
          'src/**/*.stories.*',
          'src/**/*.test.*',
          'src/**/*.spec.*',
          'node_modules/**'
        ]
      }),
    ],
  },
];