import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "port": 6006,
  "quiet": false,
  "viteFinal": async (config) => {
    // Define process.env and other Taro-related globals for Storybook
    config.define = {
      ...config.define,
      'process.env': JSON.stringify({
        TARO_ENV: 'h5',
        ENABLE_INNER_HTML: 'true',
        ENABLE_ADAPT: 'true',
        ENABLE_SIZE_APP: 'false',
        ENABLE_ADJACENT_HTML: 'true',
        ENABLE_CLONE_NODE: 'true',
        ENABLE_CONTAINS: 'true',
        ENABLE_SIZE_APIS: 'false',
        ENABLE_TEMPLATE_MATCH: 'true',
        ENABLE_MULTIMPLE: 'true',
        ENABLE_PASSIVE_EVENT: 'true',
        ENABLE_REMOVE_ATTRIBUTE: 'true',
        ENABLE_CLASS_USAGE: 'true',
        ENABLE_LAZY_LOAD: 'true',
        ENABLE_TEMPLATE_CONTENT: 'true'
      }),
      'ENABLE_INNER_HTML': JSON.stringify(true),
      'ENABLE_ADAPT': JSON.stringify(true),
      'ENABLE_SIZE_APP': JSON.stringify(false),
      'ENABLE_ADJACENT_HTML': JSON.stringify(true),
      'ENABLE_CLONE_NODE': JSON.stringify(true),
      'ENABLE_CONTAINS': JSON.stringify(true),
      'ENABLE_SIZE_APIS': JSON.stringify(false),
      'ENABLE_TEMPLATE_MATCH': JSON.stringify(true),
      'ENABLE_MULTIMPLE': JSON.stringify(true),
      'ENABLE_PASSIVE_EVENT': JSON.stringify(true),
      'ENABLE_REMOVE_ATTRIBUTE': JSON.stringify(true),
      'ENABLE_CLASS_USAGE': JSON.stringify(true),
      'ENABLE_LAZY_LOAD': JSON.stringify(true),
      'ENABLE_TEMPLATE_CONTENT': JSON.stringify(true)
    };

    // Add resolve alias for Taro modules
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};

    // 使用绝对路径指向我们的 mock 文件
    const path = require('path');
    config.resolve.alias['@tarojs/taro'] = path.resolve(__dirname, './taro-mock.js');
    config.resolve.alias['@tarojs/taro-h5'] = path.resolve(__dirname, './taro-mock.js');

    return config;
  }
};
export default config;