/**
 * 增强的 useStorage Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { globalStorageManager } from '../core/storage';
import { globalEventEmitter } from '../core/events';
import {
  StorageOptions,
  StorageReturn,
  StorageQuota,
  StorageDataWithMeta
} from '../types';

/**
 * 增强的存储 Hook
 */
export function useStorage<T = any>(
  key: string,
  options: StorageOptions<T> = {}
): StorageReturn<T> {
  const {
    defaultValue = null,
    type = 'local',
    sync = true,
    ttl,
    serializer,
    validator,
    transformer,
    onError
  } = options;

  const [data, setData] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [exists, setExists] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const mountedRef = useRef(true);
  const initialLoadRef = useRef(true);

  // 检查数据是否过期
  const checkExpiration = useCallback((storageData: StorageDataWithMeta<T>): boolean => {
    if (!storageData.ttl) return false;
    return Date.now() - storageData.timestamp > storageData.ttl;
  }, []);

  // 加载数据
  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const result = await globalStorageManager.get<StorageDataWithMeta<T>>(key, null);

      if (result === null) {
        setData(defaultValue);
        setExists(false);
        setLastUpdated(null);
        setIsExpired(false);
      } else {
        // 检查是否是带元数据的数据
        const isDataWithMeta = result && typeof result === 'object' && 'data' in result;
        const actualData = isDataWithMeta ? (result as StorageDataWithMeta<T>).data : result;
        const metaInfo = isDataWithMeta ? result as StorageDataWithMeta<T> : undefined;

        // 验证数据
        if (validator && !validator(actualData)) {
          throw new Error(`Data validation failed for key: ${key}`);
        }

        // 转换数据
        const finalData = transformer ? transformer(actualData) : actualData;

        setData(finalData);
        setExists(true);
        setLastUpdated(metaInfo?.timestamp || Date.now());
        setIsExpired(metaInfo ? checkExpiration(metaInfo) : false);

        // 如果数据已过期，删除它
        if (metaInfo && checkExpiration(metaInfo)) {
          await globalStorageManager.remove(key);
          setData(defaultValue);
          setExists(false);
          setLastUpdated(null);
          setIsExpired(false);
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      setData(defaultValue);
      setExists(false);
      setLastUpdated(null);
      setIsExpired(false);
      onError?.(error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [key, defaultValue, validator, transformer, onError, checkExpiration]);

  // 更新数据
  const update = useCallback(async (value: T) => {
    if (!mountedRef.current) return;

    try {
      // 验证数据
      if (validator && !validator(value)) {
        throw new Error(`Data validation failed for key: ${key}`);
      }

      // 转换数据
      const finalValue = transformer ? transformer(value) : value;

      setData(finalValue);
      setError(null);

      await globalStorageManager.set(key, finalValue, {
        ttl,
        serializer,
        validator,
        transformer
      });

      setExists(true);
      setLastUpdated(Date.now());
      setIsExpired(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [key, ttl, serializer, validator, transformer, onError]);

  // 删除数据
  const remove = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      await globalStorageManager.remove(key);
      setData(defaultValue);
      setError(null);
      setExists(false);
      setLastUpdated(null);
      setIsExpired(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [key, defaultValue, onError]);

  // 刷新数据
  const refresh = useCallback(() => {
    if (mountedRef.current) {
      loadData();
    }
  }, [loadData]);

  // 初始加载
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      loadData();
    }
  }, [loadData]);

  // 监听存储变化
  useEffect(() => {
    if (!sync) return;

    const unsubscribe = globalEventEmitter.on(key, (event) => {
      if (event.operation === 'set') {
        setData(event.value || defaultValue);
        setExists(true);
        setLastUpdated(event.timestamp);
        setIsExpired(false);
        setError(null);
      } else if (event.operation === 'remove') {
        setData(defaultValue);
        setExists(false);
        setLastUpdated(null);
        setIsExpired(false);
        setError(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [key, sync, defaultValue]);

  // 清理函数
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    update,
    remove,
    refresh,
    exists,
    lastUpdated,
    isExpired
  };
}

/**
 * 存储配额 Hook
 */
export function useStorageQuota(): StorageQuota | null {
  const [quota, setQuota] = useState<StorageQuota | null>(null);

  useEffect(() => {
    const loadQuota = async () => {
      try {
        const quotaInfo = await globalStorageManager.getQuota();
        setQuota(quotaInfo);
      } catch (error) {
        console.error('Failed to get storage quota:', error);
      }
    };

    loadQuota();

    // 定期更新配额信息
    const interval = setInterval(loadQuota, 30000); // 30秒更新一次

    return () => clearInterval(interval);
  }, []);

  return quota;
}

/**
 * 存储统计 Hook
 */
export function useStorageStats() {
  const [stats, setStats] = useState(() => globalStorageManager.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(globalStorageManager.getStats());
    }, 1000); // 每秒更新一次统计信息

    return () => clearInterval(interval);
  }, []);

  const reset = useCallback(() => {
    globalStorageManager.resetStats();
    setStats(globalStorageManager.getStats());
  }, []);

  return { stats, reset };
}

/**
 * 批量存储操作 Hook
 */
export function useBatchStorage<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (operations: Array<{
    key: string;
    operation: 'set' | 'remove' | 'get';
    value?: T;
  }>) => {
    setLoading(true);
    setError(null);

    try {
      const results = await globalStorageManager.batch(operations);
      return results;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}