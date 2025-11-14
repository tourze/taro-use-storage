/**
 * 向后兼容性测试 - 保持原有测试用例以验证兼容性
 */

import { renderHook, act } from '@testing-library/react';
import useStorage, { get, set, remove, refresh } from '../index';

// Mock Taro module before importing
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

import Taro from '@tarojs/taro';

const mockTaro = Taro as jest.Mocked<typeof Taro>;
declare global {
  interface Window { wx?: Record<string, unknown> }
  const wx: Record<string, unknown> | undefined
}
// Mock console methods to avoid noise in tests
const originalConsole = global.console;
beforeEach(() => {
  jest.clearAllMocks();
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  // Set up global process.env for tests
  process.env.TARO_ENV = 'h5';
});

afterEach(() => {
  global.console = originalConsole;
});

describe('useStorage', () => {
  test('应该返回初始状态和加载状态', async () => {
    mockTaro.getStorage.mockRejectedValue(new Error('Not found'));

    const { result, rerender } = renderHook(() => useStorage('test-key', 'default-value'));

    // 等待异步操作完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      rerender();
    });

    expect(result.current.data).toBe('default-value');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.remove).toBe('function');
  });

  test('应该在没有默认值时返回null', async () => {
    mockTaro.getStorage.mockRejectedValue(new Error('Not found'));

    const { result, rerender } = renderHook(() => useStorage('test-key'));

    // 等待异步操作完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      rerender();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.remove).toBe('function');
  });

  test('应该成功从存储中加载数据', async () => {
    const mockData = { name: 'test', value: 123 };
    mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: mockData });

    const { result, rerender } = renderHook(() => useStorage('test-key', null));

    // 等待异步操作完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      rerender();
    });

    expect(mockTaro.getStorage).toHaveBeenCalledWith({ key: 'test-key' });
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('应该正确更新存储值', async () => {
    mockTaro.getStorage.mockRejectedValue(new Error('Not found'));
    mockTaro.setStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

    const { result } = renderHook(() => useStorage('test-key', null));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const newValue = { updated: true };

    await act(async () => {
      await result.current.update(newValue);
    });

    expect(mockTaro.setStorage).toHaveBeenCalledWith({
      key: 'test-key',
      data: newValue,
    });
    expect(mockTaro.eventCenter.trigger).toHaveBeenCalledWith('storage_change', { key: 'test-key' });
    expect(result.current.data).toEqual(newValue);
  });

  test('应该正确处理更新失败的情况', async () => {
    mockTaro.getStorage.mockRejectedValue(new Error('Not found'));
    mockTaro.setStorage.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useStorage('test-key', null));
    const consoleWarnSpy = jest.spyOn(console, 'warn');

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const newValue = { errMsg: 'setStorage:ok', updated: true };

    await act(async () => {
      await result.current.update(newValue);
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('useStorage更新失败', expect.any(Error));
    expect(result.current.data).toEqual(newValue);
  });

  test('应该正确删除存储值', async () => {
    mockTaro.getStorage.mockResolvedValue({  errMsg: 'getStorage:ok',data: 'existing-value' });
    mockTaro.removeStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

    const { result } = renderHook(() => useStorage('test-key', 'default'));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.remove();
    });

    expect(mockTaro.removeStorage).toHaveBeenCalledWith({ key: 'test-key' });
    expect(mockTaro.eventCenter.trigger).toHaveBeenCalledWith('storage_change', { key: 'test-key' });
    expect(result.current.data).toBe('default');
  });

  test('应该正确处理删除失败的情况', async () => {
    mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: 'existing-value' });
    mockTaro.removeStorage.mockRejectedValue(new Error('Remove error'));

    const { result } = renderHook(() => useStorage('test-key', 'default'));
    const consoleWarnSpy = jest.spyOn(console, 'warn');

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.remove();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('useStorage删除失败', expect.any(Error));
    expect(result.current.data).toBe('default');
  });

  test('应该监听存储变化事件', async () => {
    mockTaro.getStorage.mockRejectedValue(new Error('Not found'));

    const { unmount } = renderHook(() => useStorage('test-key', null));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockTaro.eventCenter.on).toHaveBeenCalledTimes(1);
    expect(mockTaro.eventCenter.on).toHaveBeenCalledWith('storage_change', expect.any(Function));

    unmount();

    expect(mockTaro.eventCenter.off).toHaveBeenCalledTimes(1);
    expect(mockTaro.eventCenter.off).toHaveBeenCalledWith('storage_change', expect.any(Function));
  });

  test('应该在接收到相关存储变化时更新数据', async () => {
    const mockData = { name: 'test' };
    mockTaro.getStorage
      .mockResolvedValueOnce({ errMsg: 'getStorage:ok', data: 'initial' })
      .mockResolvedValueOnce({ errMsg: 'getStorage:ok', data: mockData });

    const { result } = renderHook(() => useStorage('test-key', null));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 获取事件监听器
    const eventListener = mockTaro.eventCenter.on.mock.calls[0][1];

    await act(async () => {
      eventListener({ key: 'test-key' });
    });

    expect(mockTaro.getStorage).toHaveBeenCalledWith({ key: 'test-key' });
    expect(result.current.data).toEqual(mockData);
  });

  test('应该忽略不相关的存储变化事件', async () => {
    const initialData = { name: 'initial' };
    mockTaro.getStorage.mockResolvedValue({  errMsg: 'getStorage:ok',data: initialData });

    const { result } = renderHook(() => useStorage('test-key', null));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 获取事件监听器
    const eventListener = mockTaro.eventCenter.on.mock.calls[0][1];

    await act(async () => {
      eventListener({ key: 'different-key' });
    });

    expect(result.current.data).toEqual(initialData);
  });

  test('应该正确处理事件监听器中的存储读取失败', async () => {
    const defaultValue = { name: 'default' };
    const consoleWarnSpy = jest.spyOn(console, 'warn');

    mockTaro.getStorage
      .mockResolvedValueOnce({  errMsg: 'getStorage:ok',data: 'initial' })
      .mockRejectedValueOnce(new Error('Storage sync error'));

    const { result } = renderHook(() => useStorage('test-key', defaultValue));

    // 等待初始加载完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 获取事件监听器
    const eventListener = mockTaro.eventCenter.on.mock.calls[0][1];

    await act(async () => {
      eventListener({ key: 'test-key' });
    });

    expect(result.current.data).toEqual(defaultValue);
    expect(consoleWarnSpy).toHaveBeenCalledWith('同步Storage错误:test-key', expect.any(Error));
  });

  test('应该正确处理存储读取失败的情况', async () => {
    const defaultValue = { name: 'default' };
    mockTaro.getStorage.mockRejectedValue(new Error('Read error'));

    const { result, rerender } = renderHook(() => useStorage('test-key', defaultValue));

    // 等待异步操作完成
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      rerender();
    });

    expect(result.current.data).toEqual(defaultValue);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});

describe('工具函数', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get 函数', () => {
    test('应该成功获取存储值', async () => {
      const mockData = { test: 'value' };
      const mockResponse = { errMsg: 'getStorage:ok', data: mockData };
      mockTaro.getStorage.mockResolvedValue(mockResponse);

      const result = await get('test-key', null);

      expect(mockTaro.getStorage).toHaveBeenCalledWith({ key: 'test-key' });
      expect(result).toEqual(mockData);
    });

    test('应该在获取失败时返回默认值', async () => {
      mockTaro.getStorage.mockRejectedValue(new Error('Not found'));
      const defaultValue = { default: 'value' };

      const result = await get('test-key', defaultValue);

      expect(result).toEqual(defaultValue);
    });

    test('应该在获取失败时返回null（默认值）', async () => {
      mockTaro.getStorage.mockRejectedValue(new Error('Not found'));

      const result = await get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set 函数', () => {
    test('应该成功设置存储值', async () => {
      const mockData = { test: 'value' };
      mockTaro.setStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

      await set('test-key', mockData);

      expect(mockTaro.setStorage).toHaveBeenCalledWith({
        key: 'test-key',
        data: mockData,
      });
      expect(mockTaro.eventCenter.trigger).toHaveBeenCalledWith('storage_change', { key: 'test-key' });
    });
  });

  describe('remove 函数', () => {
    test('应该在 H5 环境下正确删除存储', async () => {
      process.env.TARO_ENV = 'h5';
      mockTaro.removeStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

      await remove('test-key');

      expect(mockTaro.removeStorage).toHaveBeenCalledWith({ key: 'test-key' });
      expect(mockTaro.eventCenter.trigger).toHaveBeenCalledWith('storage_change', { key: 'test-key' });
    });

    test('应该在微信小程序环境下正确删除存储', async () => {
      process.env.TARO_ENV = 'weapp';

      // Mock wx global object
      const mockWx = {
        removeStorageSync: jest.fn(),
      };
      (global as { wx: typeof mockWx }).wx = mockWx;

      await remove('test-key');

      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('test-key');
      expect(mockTaro.eventCenter.trigger).toHaveBeenCalledWith('storage_change', { key: 'test-key' });
    });
  });

  describe('refresh 函数', () => {
    test('应该触发存储变化事件', () => {
      refresh('test-key');

      expect(mockTaro.eventCenter.trigger).toHaveBeenCalledWith('storage_change', { key: 'test-key' });
    });
  });
});