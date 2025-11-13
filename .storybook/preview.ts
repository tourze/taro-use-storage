import type { Preview } from '@storybook/react-vite'
import { TaroMockDecorator } from './decorators'

// Mock process.env and Taro globals for Storybook
(window as any).process = {
  env: {
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
  }
};
(global as any).process = {
  env: {
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
  }
};

// Mock Taro global variables
const taroGlobals = {
  ENABLE_INNER_HTML: true,
  ENABLE_ADAPT: true,
  ENABLE_SIZE_APP: false,
  ENABLE_ADJACENT_HTML: true,
  ENABLE_CLONE_NODE: true,
  ENABLE_CONTAINS: true,
  ENABLE_SIZE_APIS: false,
  ENABLE_TEMPLATE_MATCH: true,
  ENABLE_MULTIMPLE: true,
  ENABLE_PASSIVE_EVENT: true,
  ENABLE_REMOVE_ATTRIBUTE: true,
  ENABLE_CLASS_USAGE: true,
  ENABLE_LAZY_LOAD: true,
  ENABLE_TEMPLATE_CONTENT: true
};

// Apply globals to window and global
Object.keys(taroGlobals).forEach(key => {
  (window as any)[key] = taroGlobals[key as keyof typeof taroGlobals];
  (global as any)[key] = taroGlobals[key as keyof typeof taroGlobals];
});

// Mock Taro environment for Storybook
const mockTaro = {
  getStorage: ({ key }: { key: string }) => {
    const value = localStorage.getItem(key);
    if (value) {
      return Promise.resolve({ data: JSON.parse(value) });
    }
    return Promise.reject(new Error('Storage not found'));
  },
  setStorage: ({ key, data }: { key: string; data: any }) => {
    localStorage.setItem(key, JSON.stringify(data));
    return Promise.resolve();
  },
  removeStorage: ({ key }: { key: string }) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
  // 同步版本的方法
  getStorageSync: (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : '';
  },
  setStorageSync: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  removeStorageSync: (key: string) => {
    localStorage.removeItem(key);
  },
  eventCenter: {
    trigger: (event: string, data: any) => {
      // Mock event trigger
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    on: (event: string, callback: Function) => {
      window.addEventListener(event, callback as EventListener);
    },
    off: (event: string, callback: Function) => {
      window.removeEventListener(event, callback as EventListener);
    },
  },
  // 添加其他常用的 Taro API
  ENV_TYPE: {
    WEAPP: 'weapp',
    SWAN: 'swan',
    ALIPAY: 'alipay',
    TT: 'tt',
    QQ: 'qq',
    JD: 'jd',
    H5: 'h5'
  }
};

// Setup global Taro mock - 确保在全局和 window 上都可用
(window as any).Taro = mockTaro;
(global as any).Taro = mockTaro;

// 确保 Taro 也可以通过 require/import 访问
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mockTaro;
}

// Mock wx for weapp environment
(global as any).wx = {
  removeStorageSync: (key: string) => {
    localStorage.removeItem(key);
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [TaroMockDecorator],
};

export default preview;