/**
 * Taro 兼容层 - 提供统一的存储接口
 */

import { ITaroStorage, ITaroEventCenter, WxMiniProgram, GlobalWithWeapp, WindowWithTaro } from '../types';

/**
 * 获取 Taro 实例，支持 Storybook 环境和真实 Taro H5
 */
export const getTaroInstance = (): ITaroStorage => {
  // 优先尝试导入 Taro（正常环境）
  try {
    const taroModule = global.require('@tarojs/taro');
    if (taroModule && typeof taroModule.getStorage === 'function') {
      return taroModule as ITaroStorage;
    }
  } catch (e) {
    // 导入失败，继续尝试其他方法
  }

  // 尝试从全局获取（Storybook 环境）
  if (typeof window !== 'undefined' && (window as WindowWithTaro).Taro) {
    return (window as WindowWithTaro).Taro! as ITaroStorage;
  }
  if (typeof global !== 'undefined' && (global as any).Taro) {
    return (global as any).Taro as ITaroStorage;
  }

  // 最后的 fallback：基于 localStorage 的实现，完全模拟 Taro H5 行为
  return createFallbackTaro();
};

/**
 * 创建基于 localStorage 的 Taro 兼容实现
 */
function createFallbackTaro(): ITaroStorage {
  const eventCenter = createFallbackEventCenter();

  return {
    getStorage: async ({ key }) => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          // 处理带元数据的数据格式
          if (parsed && typeof parsed === 'object' && 'data' in parsed) {
            return { data: parsed.data, errMsg: 'getStorage:ok' };
          }
          return { data: parsed, errMsg: 'getStorage:ok' };
        } catch (e) {
          return Promise.reject(new Error(`JSON parse error for key: ${key}`));
        }
      }
      return Promise.reject(new Error('Storage not found'));
    },

    setStorage: async ({ key, data }) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return { errMsg: 'setStorage:ok', data: undefined };
      } catch (e) {
        return Promise.reject(new Error(`Storage set error for key: ${key}`));
      }
    },

    removeStorage: async ({ key }) => {
      try {
        localStorage.removeItem(key);
        return { errMsg: 'removeStorage:ok', data: undefined };
      } catch (e) {
        return Promise.reject(new Error(`Storage remove error for key: ${key}`));
      }
    },

    eventCenter,

    ENV_TYPE: {
      WEAPP: 'weapp',
      SWAN: 'swan',
      ALIPAY: 'alipay',
      TT: 'tt',
      QQ: 'qq',
      JD: 'jd',
      H5: 'h5'
    }
  };
}

/**
 * 创建基于 DOM Events 的事件中心
 */
function createFallbackEventCenter(): ITaroEventCenter {
  const listeners = new Map<string, Set<Function>>();

  return {
    trigger: (event: string, data?: any) => {
      if (typeof window !== 'undefined') {
        // 使用 CustomEvent 进行跨组件通信
        window.dispatchEvent(new CustomEvent(event, { detail: data }));
      }

      // 同时调用内部监听器
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => {
          try {
            callback(data);
          } catch (e) {
            console.error(`Error in event listener for ${event}:`, e);
          }
        });
      }
    },

    on: (event: string, callback: Function) => {
      // 添加到内部监听器
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(callback);

      // 同时监听 DOM 事件（如果在浏览器环境）
      if (typeof window !== 'undefined') {
        const wrappedCallback = (e: CustomEvent) => callback(e.detail);
        window.addEventListener(event, wrappedCallback as EventListener);

        // 返回清理函数
        return () => {
          listeners.get(event)?.delete(callback);
          window.removeEventListener(event, wrappedCallback as EventListener);
        };
      }

      // 返回清理函数
      return () => {
        listeners.get(event)?.delete(callback);
      };
    },

    off: (event: string, callback: Function) => {
      listeners.get(event)?.delete(callback);
    }
  };
}

/**
 * 获取微信小程序全局对象
 */
export const getWxInstance = (): WxMiniProgram | undefined => {
  if (typeof global !== 'undefined' && (global as GlobalWithWeapp).wx) {
    return (global as GlobalWithWeapp).wx;
  }
  return undefined;
};

/**
 * 检测当前运行环境
 */
export const detectEnvironment = (): string => {
  // 优先检查 process.env
  if (process.env.TARO_ENV) {
    return process.env.TARO_ENV;
  }

  // 检查是否在微信小程序环境
  if (typeof global !== 'undefined' && (global as GlobalWithWeapp).wx) {
    return 'weapp';
  }

  // 检查是否在 H5 环境
  if (typeof window !== 'undefined') {
    return 'h5';
  }

  // 默认返回 h5
  return 'h5';
};

/**
 * 检查存储 API 可用性
 */
export const checkStorageAvailability = (): { available: boolean; type: string; error?: string } => {
  const env = detectEnvironment();

  try {
    const taro = getTaroInstance();
    if (taro && typeof taro.getStorage === 'function') {
      return { available: true, type: env };
    }
  } catch (e) {
    return {
      available: false,
      type: env,
      error: e instanceof Error ? e.message : 'Unknown error'
    };
  }

  return { available: false, type: env, error: 'Storage API not available' };
};