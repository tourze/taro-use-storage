/**
 * 核心存储逻辑 - 提供高级存储功能
 */

import { getTaroInstance, getWxInstance, detectEnvironment } from './taro';
import {
  StorageOptions,
  StorageDataWithMeta,
  StorageSerializer,
  StorageConfig,
  StorageQuota,
  StorageStats,
  BatchOperation,
  StorageBatchResult,
  StorageChangeEvent
} from '../types';
import { globalEventEmitter, triggerStorageChange } from './events';

// 默认配置
const DEFAULT_CONFIG: StorageConfig = {
  debug: false,
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 100
};

// 默认序列化器
const DEFAULT_SERIALIZER: StorageSerializer = {
  stringify: JSON.stringify,
  parse: JSON.parse
};

/**
 * 存储管理器类
 */
export class StorageManager {
  private config: StorageConfig;
  private stats: StorageStats;
  private serializer: StorageSerializer;

  constructor(config: StorageConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.serializer = config.serializer || DEFAULT_SERIALIZER;
    this.stats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageOperationTime: 0,
      lastOperationTime: 0
    };
  }

  /**
   * 获取存储值
   */
  async get<T = any>(key: string, defaultValue: T | null = null): Promise<T | null> {
    return this.withStats(async () => {
      try {
        const taro = getTaroInstance();
        const result = await this.withTimeout(taro.getStorage({ key }));

        if (!result.data) {
          return defaultValue;
        }

        // 处理带元数据的数据
        const dataWithMeta = result.data as StorageDataWithMeta<T>;
        if (dataWithMeta && typeof dataWithMeta === 'object' && 'data' in dataWithMeta) {
          // 检查是否过期
          if (dataWithMeta.ttl && Date.now() - dataWithMeta.timestamp > dataWithMeta.ttl) {
            await this.remove(key);
            return defaultValue;
          }
          return dataWithMeta.data;
        }

        return result.data;
      } catch (error) {
        this.config.onError?.(error as Error, 'get', key);
        return defaultValue;
      }
    }, 'get');
  }

  /**
   * 设置存储值
   */
  async set<T = any>(key: string, data: T, options: StorageOptions<T> = {}): Promise<void> {
    return this.withStats(async () => {
      try {
        // 验证数据
        if (options.validator && !options.validator(data)) {
          throw new Error(`Data validation failed for key: ${key}`);
        }

        // 转换数据
        let finalData = data;
        if (options.transformer) {
          finalData = options.transformer(data);
        }

        // 准备存储数据
        let storageData: any = finalData;
        if (options.ttl) {
          storageData = {
            data: finalData,
            timestamp: Date.now(),
            ttl: options.ttl,
            version: '1.0.0'
          } as StorageDataWithMeta<T>;
        }

        const taro = getTaroInstance();
        await this.withTimeout(taro.setStorage({ key, data: storageData }));

        // 触发变化事件
        triggerStorageChange(key, finalData, 'set', 'storage-manager');
      } catch (error) {
        this.config.onError?.(error as Error, 'set', key);
        throw error;
      }
    }, 'set');
  }

  /**
   * 删除存储值
   */
  async remove(key: string): Promise<void> {
    return this.withStats(async () => {
      try {
        const env = detectEnvironment();

        if (env === 'weapp') {
          // 微信小程序环境使用同步API
          const wx = getWxInstance();
          if (wx) {
            wx.removeStorageSync(key);
          }
        } else {
          const taro = getTaroInstance();
          await this.withTimeout(taro.removeStorage({ key }));
        }

        // 触发变化事件
        triggerStorageChange(key, undefined, 'remove', 'storage-manager');
      } catch (error) {
        this.config.onError?.(error as Error, 'remove', key);
        throw error;
      }
    }, 'remove');
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * 获取存储配额信息
   */
  async getQuota(): Promise<StorageQuota | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;

        return {
          quota,
          usage,
          available: quota - usage,
          usagePercentage: quota > 0 ? (usage / quota) * 100 : 0
        };
      } catch (error) {
        this.config.onError?.(error as Error, 'quota');
        return null;
      }
    }
    return null;
  }

  /**
   * 批量操作
   */
  async batch<T = any>(operations: BatchOperation<T>[]): Promise<StorageBatchResult<T>[]> {
    const results: StorageBatchResult<T>[] = [];

    for (const operation of operations) {
      try {
        let result: T | undefined;

        switch (operation.operation) {
          case 'get':
            result = await this.get(operation.key) || undefined;
            results.push({ key: operation.key, success: true, data: result });
            break;
          case 'set':
            await this.set(operation.key, operation.value!);
            results.push({ key: operation.key, success: true });
            break;
          case 'remove':
            await this.remove(operation.key);
            results.push({ key: operation.key, success: true });
            break;
        }
      } catch (error) {
        results.push({
          key: operation.key,
          success: false,
          error: error as Error
        });
      }
    }

    return results;
  }

  /**
   * 清空所有存储
   */
  async clear(): Promise<void> {
    try {
      if ('localStorage' in window) {
        localStorage.clear();
      }
      triggerStorageChange('*', undefined, 'clear', 'storage-manager');
    } catch (error) {
      this.config.onError?.(error as Error, 'clear');
      throw error;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): StorageStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageOperationTime: 0,
      lastOperationTime: 0
    };
  }

  /**
   * 带统计的操作执行
   */
  private async withStats<T>(operation: () => Promise<T>, operationType: string): Promise<T> {
    const startTime = Date.now();
    this.stats.totalOperations++;

    try {
      const result = await operation();
      this.stats.successfulOperations++;
      return result as T;
    } catch (error) {
      this.stats.failedOperations++;
      this.config.onError?.(error as Error, operationType);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.stats.lastOperationTime = duration;
      this.stats.averageOperationTime =
        (this.stats.averageOperationTime * (this.stats.totalOperations - 1) + duration) /
        this.stats.totalOperations;

      if (this.config.debug) {
        console.log(`[Storage] ${operationType} operation took ${duration}ms`);
      }
    }
  }

  /**
   * 带超时的操作执行
   */
  private withTimeout<T>(operation: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Storage operation timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      operation
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * 带重试的操作执行
   */
  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= (this.config.retryAttempts || 1); attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < (this.config.retryAttempts || 1)) {
          if (this.config.debug) {
            console.log(`[Storage] Attempt ${attempt} failed, retrying in ${this.config.retryDelay}ms...`);
          }
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw lastError!;
  }
}

// 全局存储管理器实例
export const globalStorageManager = new StorageManager();

/**
 * 设置全局存储配置
 */
export const setGlobalStorageConfig = (config: StorageConfig): void => {
  Object.assign(globalStorageManager, config);
};