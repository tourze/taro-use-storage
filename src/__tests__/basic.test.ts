/**
 * 基础功能测试 - 验证核心功能正常工作
 */

import { renderHook, act } from '@testing-library/react';
import useStorage, { get, set, remove } from '../index';

// 简单的 localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock Taro
jest.mock('@tarojs/taro', () => ({
  getStorage: jest.fn(),
  setStorage: jest.fn(),
  removeStorage: jest.fn(),
  eventCenter: {
    on: jest.fn(),
    off: jest.fn(),
    trigger: jest.fn(),
  },
  ENV_TYPE: {
    WEAPP: 'weapp',
    ALIPAY: 'alipay',
    H5: 'h5',
  },
}));

describe('基础功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('useStorage 基础功能应该正常工作', async () => {
    const { result } = renderHook(() => useStorage('test-key', 'default-value'));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 验证初始状态
    expect(result.current.data).toBe('default-value');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.remove).toBe('function');
  });

  test('工具函数基础功能应该正常工作', async () => {
    // 测试 set 函数
    await set('test-key', 'test-value');

    // 测试 get 函数
    const value = await get('test-key');
    expect(value).toBe('test-value');

    // 测试 remove 函数
    await remove('test-key');
    const removedValue = await get('test-key', 'removed');
    expect(removedValue).toBe('removed');
  });

  test('useStorage 更新功能应该正常工作', async () => {
    const { result } = renderHook(() => useStorage('counter', 0));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 验证初始值
    expect(result.current.data).toBe(0);

    // 更新值
    await act(async () => {
      await result.current.update(5);
    });

    // 验证更新后的值
    expect(result.current.data).toBe(5);
  });

  test('useStorage 删除功能应该正常工作', async () => {
    const { result } = renderHook(() => useStorage('test-key', 'default'));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 先设置一个值
    await act(async () => {
      await result.current.update('test-value');
    });

    // 验证值已设置
    expect(result.current.data).toBe('test-value');

    // 删除值
    await act(async () => {
      await result.current.remove();
    });

    // 验证值已恢复为默认值
    expect(result.current.data).toBe('default');
  });
});