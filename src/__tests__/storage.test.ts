/**
 * 存储管理器测试
 */

import { StorageManager } from '../core/storage';
import { StorageOptions } from '../types';

// Mock Taro module
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

describe('StorageManager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    jest.clearAllMocks();
    storageManager = new StorageManager();
  });

  describe('基础操作', () => {
    test('应该成功获取存储值', async () => {
      const mockData = { name: 'test', value: 123 };
      mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: mockData });

      const result = await storageManager.get('test-key');
      expect(result).toEqual(mockData);
      expect(mockTaro.getStorage).toHaveBeenCalledWith({ key: 'test-key' });
    });

    test('应该在获取失败时返回默认值', async () => {
      mockTaro.getStorage.mockRejectedValue(new Error('Not found'));
      const defaultValue = { default: 'value' };

      const result = await storageManager.get('test-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    test('应该成功设置存储值', async () => {
      const mockData = { test: 'value' };
      mockTaro.setStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

      await storageManager.set('test-key', mockData);

      expect(mockTaro.setStorage).toHaveBeenCalledWith({
        key: 'test-key',
        data: mockData,
      });
    });

    test('应该成功删除存储值', async () => {
      mockTaro.removeStorage.mockResolvedValue({ errMsg: 'removeStorage:ok' });

      await storageManager.remove('test-key');

      expect(mockTaro.removeStorage).toHaveBeenCalledWith({ key: 'test-key' });
    });
  });

  describe('高级功能', () => {
    test('应该正确处理带 TTL 的数据', async () => {
      const mockData = { data: 'test', timestamp: Date.now(), ttl: 60000 };
      mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: mockData });

      const result = await storageManager.get('test-key');
      expect(result).toEqual('test');
    });

    test('应该检测并删除过期的数据', async () => {
      const expiredData = {
        data: 'expired',
        timestamp: Date.now() - 120000, // 2分钟前
        ttl: 60000 // 1分钟TTL
      };
      const defaultValue = 'default';

      mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: expiredData });
      mockTaro.removeStorage.mockResolvedValue({ errMsg: 'removeStorage:ok' });

      const result = await storageManager.get('test-key', defaultValue);
      expect(result).toEqual(defaultValue);
      expect(mockTaro.removeStorage).toHaveBeenCalledWith({ key: 'test-key' });
    });

    test('应该正确处理数据验证', async () => {
      const validator = (data: any) => data && typeof data.name === 'string';
      const invalidData = { invalid: 'data' };

      mockTaro.setStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

      await expect(
        storageManager.set('test-key', invalidData, { validator })
      ).rejects.toThrow('Data validation failed');
    });

    test('应该正确处理数据转换', async () => {
      const transformer = (data: any) => ({ ...data, transformed: true });
      const originalData = { name: 'test' };
      const expectedData = { name: 'test', transformed: true };

      mockTaro.setStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

      await storageManager.set('test-key', originalData, { transformer });

      expect(mockTaro.setStorage).toHaveBeenCalledWith({
        key: 'test-key',
        data: expectedData,
      });
    });
  });

  describe('批量操作', () => {
    test('应该正确执行批量操作', async () => {
      const operations = [
        { key: 'key1', operation: 'set' as const, value: 'value1' },
        { key: 'key2', operation: 'get' as const },
        { key: 'key3', operation: 'remove' as const },
      ];

      mockTaro.setStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });
      mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: 'value2' });
      mockTaro.removeStorage.mockResolvedValue({ errMsg: 'removeStorage:ok' });

      const results = await storageManager.batch(operations);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[1].data).toBe('value2');
      expect(results[2].success).toBe(true);
    });

    test('应该正确处理批量操作中的错误', async () => {
      const operations = [
        { key: 'key1', operation: 'set' as const, value: 'value1' },
        { key: 'key2', operation: 'set' as const, value: 'value2' },
      ];

      mockTaro.setStorage
        .mockResolvedValueOnce({ errMsg: 'setStorage:ok' })
        .mockRejectedValueOnce(new Error('Storage error'));

      const results = await storageManager.batch(operations);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeInstanceOf(Error);
    });
  });

  describe('统计信息', () => {
    test('应该正确跟踪操作统计', async () => {
      mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: 'test' });
      mockTaro.setStorage.mockResolvedValue({ errMsg: 'setStorage:ok' });

      await storageManager.get('test-key');
      await storageManager.set('test-key', 'value');

      const stats = storageManager.getStats();
      expect(stats.totalOperations).toBe(2);
      expect(stats.successfulOperations).toBe(2);
      expect(stats.failedOperations).toBe(0);
    });

    test('应该正确跟踪失败的操作', async () => {
      mockTaro.getStorage.mockRejectedValue(new Error('Storage error'));

      await storageManager.get('test-key');

      const stats = storageManager.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successfulOperations).toBe(0);
      expect(stats.failedOperations).toBe(1);
    });

    test('应该能够重置统计信息', async () => {
      mockTaro.getStorage.mockResolvedValue({ errMsg: 'getStorage:ok', data: 'test' });

      await storageManager.get('test-key');
      storageManager.resetStats();

      const stats = storageManager.getStats();
      expect(stats.totalOperations).toBe(0);
    });
  });

  describe('配额检测', () => {
    test('应该返回存储配额信息', async () => {
      const mockQuota = { quota: 1000000, usage: 500000 };
      const mockEstimate = jest.fn().mockResolvedValue(mockQuota);

      Object.defineProperty(navigator, 'storage', {
        value: { estimate: mockEstimate },
        writable: true
      });

      const quota = await storageManager.getQuota();
      expect(quota).toEqual({
        quota: 1000000,
        usage: 500000,
        available: 500000,
        usagePercentage: 50
      });
    });

    test('在不支持配额检测的环境中返回 null', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        writable: true
      });

      const quota = await storageManager.getQuota();
      expect(quota).toBeNull();
    });
  });
});