/**
 * 存储工具函数
 */

import { globalStorageManager } from '../core/storage';
import { triggerStorageChange } from '../core/events';
import { StorageOptions } from '../types';

/**
 * 简单的存储值获取
 */
export const get = async <T = any>(key: string, defaultValue: T | null = null): Promise<T | null> => {
  return globalStorageManager.get(key, defaultValue);
};

/**
 * 简单的存储值设置
 */
export const set = async <T = any>(key: string, data: T, options: StorageOptions<T> = {}): Promise<void> => {
  await globalStorageManager.set(key, data, options);
};

/**
 * 简单的存储值删除
 */
export const remove = async (key: string): Promise<void> => {
  await globalStorageManager.remove(key);
};

/**
 * 触发存储刷新（通知其他组件）
 */
export const refresh = (key: string): void => {
  triggerStorageChange(key, undefined, 'set', 'manual-refresh');
};

/**
 * 检查存储键是否存在
 */
export const exists = async (key: string): Promise<boolean> => {
  return globalStorageManager.exists(key);
};

/**
 * 清空所有存储
 */
export const clear = async (): Promise<void> => {
  await globalStorageManager.clear();
};

/**
 * 获取存储配额信息
 */
export const getQuota = async () => {
  return globalStorageManager.getQuota();
};

/**
 * 获取存储统计信息
 */
export const getStats = () => {
  return globalStorageManager.getStats();
};

/**
 * 重置存储统计信息
 */
export const resetStats = () => {
  globalStorageManager.resetStats();
};

/**
 * 批量存储操作
 */
export const batch = async <T = any>(operations: Array<{
  key: string;
  operation: 'set' | 'remove' | 'get';
  value?: T;
}>) => {
  return globalStorageManager.batch(operations);
};

/**
 * 设置存储数据并指定过期时间
 */
export const setWithTTL = async <T = any>(
  key: string,
  data: T,
  ttl: number // 毫秒
): Promise<void> => {
  await globalStorageManager.set(key, data, { ttl });
};

/**
 * 获取存储数据的剩余生存时间
 */
export const getTTL = async (key: string): Promise<number | null> => {
  try {
    const data = await globalStorageManager.get(key);
    if (data && typeof data === 'object' && 'timestamp' in data && 'ttl' in data) {
      const elapsed = Date.now() - data.timestamp;
      return Math.max(0, data.ttl - elapsed);
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * 迁移存储数据（重命名键）
 */
export const migrate = async (oldKey: string, newKey: string): Promise<boolean> => {
  try {
    const data = await globalStorageManager.get(oldKey);
    if (data !== null) {
      await globalStorageManager.set(newKey, data);
      await globalStorageManager.remove(oldKey);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * 复制存储数据
 */
export const copy = async (sourceKey: string, targetKey: string): Promise<boolean> => {
  try {
    const data = await globalStorageManager.get(sourceKey);
    if (data !== null) {
      await globalStorageManager.set(targetKey, data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * 导出存储数据
 */
export const exportData = async (keys?: string[]): Promise<Record<string, any>> => {
  const result: Record<string, any> = {};

  if (!keys) {
    // 如果没有指定键，需要从 localStorage 获取所有键
    if (typeof window !== 'undefined' && window.localStorage) {
      keys = Object.keys(localStorage);
    } else {
      return result;
    }
  }

  for (const key of keys) {
    try {
      const value = await globalStorageManager.get(key);
      if (value !== null) {
        result[key] = value;
      }
    } catch {
      // 忽略错误，继续处理其他键
    }
  }

  return result;
};

/**
 * 导入存储数据
 */
export const importData = async (data: Record<string, any>, options: {
  overwrite?: boolean;
  prefix?: string;
} = {}): Promise<{ success: number; failed: number; errors: string[] }> => {
  const { overwrite = false, prefix = '' } = options;
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    try {
      const finalKey = prefix + key;
      const exists = await globalStorageManager.exists(finalKey);

      if (!exists || overwrite) {
        await globalStorageManager.set(finalKey, value);
        success++;
      } else {
        failed++;
        errors.push(`Key "${finalKey}" already exists and overwrite is disabled`);
      }
    } catch (error) {
      failed++;
      errors.push(`Failed to import key "${prefix + key}": ${error}`);
    }
  }

  return { success, failed, errors };
};

/**
 * 缓存装饰器函数
 */
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T => {
  return (async (...args: Parameters<T>) => {
    const cacheKey = keyGenerator(...args);

    try {
      // 尝试从缓存获取
      const cached = await globalStorageManager.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    } catch {
      // 缓存读取失败，继续执行原函数
    }

    // 执行原函数
    const result = await fn(...args);

    // 存储到缓存
    try {
      await globalStorageManager.set(cacheKey, result, { ttl });
    } catch {
      // 缓存写入失败，不影响返回结果
    }

    return result;
  }) as T;
};