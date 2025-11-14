/**
 * Hooks 测试
 */

import { renderHook, act } from '@testing-library/react';
import { useStorage, useStorageQuota, useStorageStats } from '../hooks/useStorage';
import { globalStorageManager } from '../core/storage';

// Mock storage manager
jest.mock('../core/storage', () => ({
  globalStorageManager: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
    getQuota: jest.fn(),
    getStats: jest.fn(),
    resetStats: jest.fn()
  }
}));

// Mock event emitter
jest.mock('../core/events', () => ({
  globalEventEmitter: {
    on: jest.fn(() => jest.fn()),
    off: jest.fn()
  }
}));

describe('useStorage Hook', () => {
  const mockGet = globalStorageManager.get as jest.MockedFunction<typeof globalStorageManager.get>;
  const mockSet = globalStorageManager.set as jest.MockedFunction<typeof globalStorageManager.set>;
  const mockRemove = globalStorageManager.remove as jest.MockedFunction<typeof globalStorageManager.remove>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(null);
    mockSet.mockResolvedValue();
    mockRemove.mockResolvedValue();
  });

  test('应该返回初始状态', async () => {
    mockGet.mockResolvedValue(null);

    const { result } = renderHook(() => useStorage('test-key', 'default-value'));

    // 等待初始加载
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).toBe('default-value');
    expect(result.current.loading).toBe(false);
    expect(result.current.exists).toBe(false);
    expect(result.current.isExpired).toBe(false);
  });

  test('应该成功加载存储数据', async () => {
    const mockData = { name: 'test', value: 123 };
    mockGet.mockResolvedValue(mockData);

    const { result } = renderHook(() => useStorage('test-key'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.exists).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  test('应该正确更新数据', async () => {
    const newValue = { updated: true };
    mockGet.mockResolvedValue(null);
    mockSet.mockResolvedValue();

    const { result } = renderHook(() => useStorage('test-key'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.update(newValue);
    });

    expect(mockSet).toHaveBeenCalledWith('test-key', newValue, expect.any(Object));
    expect(result.current.data).toEqual(newValue);
  });

  test('应该正确删除数据', async () => {
    const defaultValue = 'default';
    mockGet.mockResolvedValue('existing-value');
    mockRemove.mockResolvedValue();

    const { result } = renderHook(() => useStorage('test-key', defaultValue));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.remove();
    });

    expect(mockRemove).toHaveBeenCalledWith('test-key');
    expect(result.current.data).toBe(defaultValue);
    expect(result.current.exists).toBe(false);
  });

  test('应该正确处理数据验证', async () => {
    const validator = (data: any) => data && typeof data.name === 'string';
    const invalidData = { invalid: 'data' };

    mockGet.mockResolvedValue(null);
    mockSet.mockResolvedValue();

    const { result } = renderHook(() => useStorage('test-key', null, { validator }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await expect(result.current.update(invalidData)).rejects.toThrow('Data validation failed');
  });

  test('应该正确处理数据转换', async () => {
    const transformer = (data: any) => ({ ...data, transformed: true });
    const originalData = { name: 'test' };
    const expectedData = { name: 'test', transformed: true };

    mockGet.mockResolvedValue(null);
    mockSet.mockResolvedValue();

    const { result } = renderHook(() => useStorage('test-key', null, { transformer }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.update(originalData);
    });

    expect(mockSet).toHaveBeenCalledWith('test-key', expectedData, expect.any(Object));
  });

  test('应该正确处理 TTL 数据', async () => {
    const dataWithMeta = {
      data: 'test-data',
      timestamp: Date.now(),
      ttl: 60000
    };

    mockGet.mockResolvedValue(dataWithMeta);

    const { result } = renderHook(() => useStorage('test-key'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).toBe('test-data');
    expect(result.current.lastUpdated).toBe(dataWithMeta.timestamp);
    expect(result.current.isExpired).toBe(false);
  });

  test('应该检测并处理过期数据', async () => {
    const expiredData = {
      data: 'expired',
      timestamp: Date.now() - 120000, // 2分钟前
      ttl: 60000 // 1分钟TTL，已过期
    };

    mockGet.mockResolvedValue(expiredData);
    mockRemove.mockResolvedValue();

    const { result } = renderHook(() => useStorage('test-key', 'default'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).toBe('default');
    expect(result.current.isExpired).toBe(true);
    expect(mockRemove).toHaveBeenCalledWith('test-key');
  });

  test('应该正确处理错误', async () => {
    const onError = jest.fn();
    mockGet.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() =>
      useStorage('test-key', 'default', { onError })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBe('default');
    expect(onError).toHaveBeenCalled();
  });
});

describe('useStorageQuota Hook', () => {
  const mockGetQuota = globalStorageManager.getQuota as jest.MockedFunction<typeof globalStorageManager.getQuota>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetQuota.mockResolvedValue(null);
  });

  test('应该返回存储配额信息', async () => {
    const mockQuota = {
      quota: 1000000,
      usage: 500000,
      available: 500000,
      usagePercentage: 50
    };
    mockGetQuota.mockResolvedValue(mockQuota);

    const { result } = renderHook(() => useStorageQuota());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual(mockQuota);
  });

  test('在不支持的环境中返回 null', async () => {
    mockGetQuota.mockResolvedValue(null);

    const { result } = renderHook(() => useStorageQuota());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toBeNull();
  });
});

describe('useStorageStats Hook', () => {
  const mockGetStats = globalStorageManager.getStats as jest.MockedFunction<typeof globalStorageManager.getStats>;
  const mockResetStats = globalStorageManager.resetStats as jest.MockedFunction<typeof globalStorageManager.resetStats>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats.mockReturnValue({
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageOperationTime: 0,
      lastOperationTime: 0
    });
  });

  test('应该返回统计信息', () => {
    const mockStats = {
      totalOperations: 10,
      successfulOperations: 8,
      failedOperations: 2,
      averageOperationTime: 150,
      lastOperationTime: 100
    };
    mockGetStats.mockReturnValue(mockStats);

    const { result } = renderHook(() => useStorageStats());

    expect(result.current.stats).toEqual(mockStats);
  });

  test('应该能够重置统计信息', () => {
    const { result } = renderHook(() => useStorageStats());

    act(() => {
      result.current.reset();
    });

    expect(mockResetStats).toHaveBeenCalled();
  });
});