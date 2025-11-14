/**
 * 工具函数测试
 */

import {
  get,
  set,
  remove,
  refresh,
  exists,
  clear,
  getQuota,
  getStats,
  resetStats,
  batch,
  setWithTTL,
  getTTL,
  migrate,
  copy,
  exportData,
  importData,
  withCache
} from '../utils';

// Mock storage manager and events
jest.mock('../core/storage', () => ({
  globalStorageManager: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
    getQuota: jest.fn(),
    getStats: jest.fn(),
    resetStats: jest.fn(),
    clear: jest.fn(),
    batch: jest.fn()
  }
}));

jest.mock('../core/events', () => ({
  triggerStorageChange: jest.fn()
}));

describe('工具函数', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基础操作函数', () => {
    test('get 函数应该调用 storageManager.get', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.get.mockResolvedValue('test-value');

      const result = await get('test-key', 'default');

      expect(globalStorageManager.get).toHaveBeenCalledWith('test-key', 'default');
      expect(result).toBe('test-value');
    });

    test('set 函数应该调用 storageManager.set', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.set.mockResolvedValue();

      await set('test-key', 'test-value', { ttl: 60000 });

      expect(globalStorageManager.set).toHaveBeenCalledWith('test-key', 'test-value', { ttl: 60000 });
    });

    test('remove 函数应该调用 storageManager.remove', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.remove.mockResolvedValue();

      await remove('test-key');

      expect(globalStorageManager.remove).toHaveBeenCalledWith('test-key');
    });

    test('exists 函数应该调用 storageManager.exists', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.exists.mockResolvedValue(true);

      const result = await exists('test-key');

      expect(globalStorageManager.exists).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    test('clear 函数应该调用 storageManager.clear', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.clear.mockResolvedValue();

      await clear();

      expect(globalStorageManager.clear).toHaveBeenCalled();
    });
  });

  describe('refresh 函数', () => {
    test('应该触发存储变化事件', () => {
      const { triggerStorageChange } = require('../core/events');

      refresh('test-key');

      expect(triggerStorageChange).toHaveBeenCalledWith('test-key', undefined, 'set', 'manual-refresh');
    });
  });

  describe('统计和配额函数', () => {
    test('getQuota 函数应该调用 storageManager.getQuota', async () => {
      const { globalStorageManager } = require('../core/storage');
      const mockQuota = { quota: 1000000, usage: 500000 };
      globalStorageManager.getQuota.mockResolvedValue(mockQuota);

      const result = await getQuota();

      expect(globalStorageManager.getQuota).toHaveBeenCalled();
      expect(result).toEqual(mockQuota);
    });

    test('getStats 函数应该调用 storageManager.getStats', () => {
      const { globalStorageManager } = require('../core/storage');
      const mockStats = { totalOperations: 10 };
      globalStorageManager.getStats.mockReturnValue(mockStats);

      const result = getStats();

      expect(globalStorageManager.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    test('resetStats 函数应该调用 storageManager.resetStats', () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.resetStats.mockReturnValue();

      resetStats();

      expect(globalStorageManager.resetStats).toHaveBeenCalled();
    });
  });

  describe('batch 函数', () => {
    test('应该调用 storageManager.batch', async () => {
      const { globalStorageManager } = require('../core/storage');
      const operations = [
        { key: 'key1', operation: 'set' as const, value: 'value1' },
        { key: 'key2', operation: 'get' as const }
      ];
      const mockResults = [{ key: 'key1', success: true }];
      globalStorageManager.batch.mockResolvedValue(mockResults);

      const result = await batch(operations);

      expect(globalStorageManager.batch).toHaveBeenCalledWith(operations);
      expect(result).toEqual(mockResults);
    });
  });

  describe('TTL 相关函数', () => {
    test('setWithTTL 函数应该使用 TTL 选项调用 set', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.set.mockResolvedValue();

      await setWithTTL('test-key', 'test-value', 60000);

      expect(globalStorageManager.set).toHaveBeenCalledWith('test-key', 'test-value', { ttl: 60000 });
    });

    test('getTTL 函数应该返回剩余生存时间', async () => {
      const { globalStorageManager } = require('../core/storage');
      const dataWithMeta = {
        data: 'test',
        timestamp: Date.now() - 30000, // 30秒前
        ttl: 60000 // 60秒TTL
      };
      globalStorageManager.get.mockResolvedValue(dataWithMeta);

      const result = await getTTL('test-key');

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(30000);
    });

    test('getTTL 函数应该对没有 TTL 的数据返回 null', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.get.mockResolvedValue('simple-data');

      const result = await getTTL('test-key');

      expect(result).toBeNull();
    });
  });

  describe('数据迁移函数', () => {
    test('migrate 函数应该成功迁移数据', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.get.mockResolvedValue('test-data');
      globalStorageManager.set.mockResolvedValue();
      globalStorageManager.remove.mockResolvedValue();

      const result = await migrate('old-key', 'new-key');

      expect(globalStorageManager.get).toHaveBeenCalledWith('old-key');
      expect(globalStorageManager.set).toHaveBeenCalledWith('new-key', 'test-data');
      expect(globalStorageManager.remove).toHaveBeenCalledWith('old-key');
      expect(result).toBe(true);
    });

    test('migrate 函数应该对不存在的数据返回 false', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.get.mockResolvedValue(null);

      const result = await migrate('old-key', 'new-key');

      expect(globalStorageManager.get).toHaveBeenCalledWith('old-key');
      expect(globalStorageManager.set).not.toHaveBeenCalled();
      expect(globalStorageManager.remove).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('copy 函数应该成功复制数据', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.get.mockResolvedValue('test-data');
      globalStorageManager.set.mockResolvedValue();

      const result = await copy('source-key', 'target-key');

      expect(globalStorageManager.get).toHaveBeenCalledWith('source-key');
      expect(globalStorageManager.set).toHaveBeenCalledWith('target-key', 'test-data');
      expect(result).toBe(true);
    });
  });

  describe('数据导入导出函数', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          keys: jest.fn(() => ['key1', 'key2']),
          getItem: jest.fn((key) => key === 'key1' ? '"value1"' : '{"key": "value2"}')
        },
        writable: true
      });
    });

    test('exportData 函数应该导出指定键的数据', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.get
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce({ key: 'value2' });

      const result = await exportData(['key1', 'key2']);

      expect(result).toEqual({
        key1: 'value1',
        key2: { key: 'value2' }
      });
    });

    test('importData 函数应该成功导入数据', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.exists.mockResolvedValue(false);
      globalStorageManager.set.mockResolvedValue();

      const data = { key1: 'value1', key2: 'value2' };

      const result = await importData(data);

      expect(globalStorageManager.set).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });

    test('importData 函数应该处理已存在的键', async () => {
      const { globalStorageManager } = require('../core/storage');
      globalStorageManager.exists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      globalStorageManager.set.mockResolvedValue();

      const data = { key1: 'value1', key2: 'value2' };

      const result = await importData(data, { overwrite: false });

      expect(globalStorageManager.set).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('withCache 函数', () => {
    test('应该缓存函数结果', async () => {
      const { globalStorageManager } = require('../core/storage');
      const mockFn = jest.fn().mockResolvedValue('computed-value');

      globalStorageManager.get.mockResolvedValue(null);
      globalStorageManager.set.mockResolvedValue();

      const cachedFn = withCache(mockFn, () => 'cache-key');

      const result = await cachedFn('arg1', 'arg2');

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(globalStorageManager.set).toHaveBeenCalledWith('cache-key', 'computed-value', { ttl: undefined });
      expect(result).toBe('computed-value');
    });

    test('应该返回缓存的结果', async () => {
      const { globalStorageManager } = require('../core/storage');
      const mockFn = jest.fn().mockResolvedValue('computed-value');

      globalStorageManager.get.mockResolvedValue('cached-value');

      const cachedFn = withCache(mockFn, () => 'cache-key');

      const result = await cachedFn('arg1', 'arg2');

      expect(mockFn).not.toHaveBeenCalled();
      expect(globalStorageManager.set).not.toHaveBeenCalled();
      expect(result).toBe('cached-value');
    });

    test('应该支持 TTL', async () => {
      const { globalStorageManager } = require('../core/storage');
      const mockFn = jest.fn().mockResolvedValue('computed-value');

      globalStorageManager.get.mockResolvedValue(null);
      globalStorageManager.set.mockResolvedValue();

      const cachedFn = withCache(mockFn, () => 'cache-key', 60000);

      await cachedFn('arg1', 'arg2');

      expect(globalStorageManager.set).toHaveBeenCalledWith('cache-key', 'computed-value', { ttl: 60000 });
    });
  });
});