/**
 * Jest 测试环境设置
 */

// 模拟 global.require，使用 Object.defineProperty 避免 ESLint 错误
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'require', {
    value: jest.fn(),
    writable: true,
    configurable: true
  });
}

// 模拟 navigator.storage
Object.defineProperty(global.navigator, 'storage', {
  value: {
    estimate: jest.fn().mockResolvedValue({
      quota: 10000000,
      usage: 1000000
    })
  },
  writable: true,
  configurable: true
});

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(global.window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

// 模拟 window.dispatchEvent
global.window.dispatchEvent = jest.fn();

// 模拟 window.addEventListener
global.window.addEventListener = jest.fn();

// 模拟 window.removeEventListener
global.window.removeEventListener = jest.fn();

// 设置 process.env
process.env.TARO_ENV = 'h5';