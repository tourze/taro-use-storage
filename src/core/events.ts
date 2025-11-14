/**
 * 事件管理系统 - 处理存储变化事件的订阅和发布
 */

import { StorageChangeEvent } from '../types';

export class StorageEventEmitter {
  private listeners = new Map<string, Set<(event: StorageChangeEvent) => void>>();
  private globalListeners = new Set<(event: StorageChangeEvent) => void>();

  /**
   * 订阅特定键的变化
   */
  on(key: string, listener: (event: StorageChangeEvent) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // 返回取消订阅函数
    return () => {
      this.listeners.get(key)?.delete(listener);
      if (this.listeners.get(key)?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  /**
   * 订阅所有存储变化
   */
  onAny(listener: (event: StorageChangeEvent) => void): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  /**
   * 取消订阅特定键的变化
   */
  off(key: string, listener: (event: StorageChangeEvent) => void): void {
    this.listeners.get(key)?.delete(listener);
  }

  /**
   * 发布存储变化事件
   */
  emit(event: StorageChangeEvent): void {
    // 通知特定键的监听器
    const keyListeners = this.listeners.get(event.key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in storage event listener for key "${event.key}":`, error);
        }
      });
    }

    // 通知全局监听器
    this.globalListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in global storage event listener:', error);
      }
    });
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.listeners.clear();
    this.globalListeners.clear();
  }

  /**
   * 获取指定键的监听器数量
   */
  getListenerCount(key?: string): number {
    if (key) {
      return this.listeners.get(key)?.size || 0;
    }
    return Array.from(this.listeners.values()).reduce((total, set) => total + set.size, 0) + this.globalListeners.size;
  }

  /**
   * 获取所有被监听的键
   */
  getMonitoredKeys(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// 全局事件发射器实例
export const globalEventEmitter = new StorageEventEmitter();

/**
 * 触发存储变化事件
 */
export const triggerStorageChange = <T = any>(
  key: string,
  value: T | undefined,
  operation: 'set' | 'remove' | 'clear',
  source?: string
): void => {
  const event: StorageChangeEvent<T> = {
    key,
    value,
    operation,
    timestamp: Date.now(),
    source: source || 'unknown'
  };

  globalEventEmitter.emit(event);
};

/**
 * 创建带命名空间的事件发射器
 */
export const createNamespacedEventEmitter = (namespace: string) => {
  return {
    on: (key: string, listener: (event: StorageChangeEvent) => void) => {
      const namespacedKey = `${namespace}:${key}`;
      return globalEventEmitter.on(namespacedKey, listener);
    },
    off: (key: string, listener: (event: StorageChangeEvent) => void) => {
      const namespacedKey = `${namespace}:${key}`;
      globalEventEmitter.off(namespacedKey, listener);
    },
    emit: (key: string, value: any, operation: 'set' | 'remove' | 'clear', source?: string) => {
      const namespacedKey = `${namespace}:${key}`;
      triggerStorageChange(namespacedKey, value, operation, source);
    }
  };
};