/* leny/react-use-storage
 *
 * /src/index.js - React Hook to handle local and session storage
 *
 * coded by leny@flatLand!
 * started at 03/03/2019
 */
// 好好想一下使用redux的理由，最大理由就是希望View/Data同步
// 既然如此，使用react-hooks封装Storage操作应该是更加合理的方案才对？

import { useState, useEffect, useCallback } from "react";

// 获取 Taro 实例，支持 Storybook 环境
const getTaro = () => {
  // 优先尝试导入 Taro（正常环境）
  try {
    // 动态导入，避免在 Storybook 环境中报错
    if (typeof require !== 'undefined') {
      const Taro = require('@tarojs/taro');
      if (Taro && Taro.getStorage) {
        return Taro;
      }
    }
  } catch (e) {
    // 导入失败，继续尝试其他方法
  }

  // 尝试从全局获取（Storybook 环境）
  if (typeof window !== 'undefined' && (window as any).Taro) {
    return (window as any).Taro;
  }
  if (typeof global !== 'undefined' && (global as any).Taro) {
    return (global as any).Taro;
  }

  // 最后的 fallback：基于 localStorage 的实现
  return {
    getStorage: ({ key }: { key: string }) => {
      const value = localStorage.getItem(key);
      if (value) {
        return Promise.resolve({ data: JSON.parse(value) });
      }
      return Promise.reject(new Error('Storage not found'));
    },
    setStorage: ({ key, data }: { key: string; data: any }) => {
      localStorage.setItem(key, JSON.stringify(data));
      return Promise.resolve();
    },
    removeStorage: ({ key }: { key: string }) => {
      localStorage.removeItem(key);
      return Promise.resolve();
    },
    eventCenter: {
      trigger: (event: string, data: any) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(event, { detail: data }));
        }
      },
      on: (event: string, callback: Function) => {
        if (typeof window !== 'undefined') {
          window.addEventListener(event, callback as EventListener);
        }
      },
      off: (event: string, callback: Function) => {
        if (typeof window !== 'undefined') {
          window.removeEventListener(event, callback as EventListener);
        }
      },
    },
  };
};

const Taro = getTaro();

const EVENT_KEY = "storage_change";

// 刷新存储值
const refresh = (key: string) => {
  Taro.eventCenter.trigger(EVENT_KEY, { key });
};

// 提供一个简单的方法，读取本地存储
const get = async (key: string, defaultValue = null) => {
  try {
    const result = await Taro.getStorage({ key });
    return result.data;
  } catch (e) {
    return defaultValue;
  }
};

// 设置值
// 有些情形下，我们可能不在hooks上下文中对存储的值进行了修改，但是又希望界面做出相应，那么可以使用这个方法
const set = async (key: string, data: unknown) => {
  const res = await Taro.setStorage({ key, data });
  refresh(key);
  return res;
};

const remove = async (key: string) => {
  if (process.env.TARO_ENV === 'weapp') {
    // 微信小程序环境使用同步API
    const wx = (global as { wx?: { removeStorageSync: (key: string) => void } }).wx;
    if (wx) {
      wx.removeStorageSync(key);
    }
  } else {
    await Taro.removeStorage({ key });
  }
  refresh(key);
};

const useStorage = <T = unknown>(key: string, defaultValue: T | null = null) => {
  const [data, setData] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 第一次进入先尝试读取
  useEffect(() => {
    console.log("load storage", key, JSON.stringify(defaultValue));
    Taro.getStorage({ key })
      .then((res) => {
        setData(res.data);
        setLoading(false);
        return setError(null);
      })
      .catch((err) => {
        setData(defaultValue);
        setLoading(false);
        setError(err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 监听其他来源的变化
  useEffect(() => {
    console.log("listen storage", key, JSON.stringify(defaultValue));
    const listener = async (v: { key: string }) => {
      if (v.key === key) {
        // 因为一般说，更新速度都是很快的，所以就没必要这里再setLoading
        try {
          const res = await Taro.getStorage({
            key: v.key,
          });
          return setData(res.data);
        } catch (e) {
          setData(defaultValue);
          console.warn(`同步Storage错误:${v.key}`, e);
        }
      }
    };

    Taro.eventCenter.on(EVENT_KEY, listener);
    return () => {
      Taro.eventCenter.off(EVENT_KEY, listener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 更新
  const update = useCallback(
    async (updatedValue: T) => {
      setData(updatedValue);
      try {
        await Taro.setStorage({
          key,
          data: updatedValue,
        });
      } catch (e) {
        console.warn("useStorage更新失败", e);
        return;
      }
      refresh(key);
    },
    [key],
  );

  // 删除
  const removeFunc = useCallback(async () => {
    setData(defaultValue);
    try {
      await Taro.removeStorage({ key });
    } catch (e) {
      console.warn("useStorage删除失败", e);
      return;
    }
    refresh(key);
  }, [defaultValue, key]);

  return {
    data, // 当前的最新值
    loading, // 是否加载中
    error, // 错误
    update, // 更新值使用这个方法
    remove: removeFunc, // 删除值使用这个方法
  } as {
    data: T | null;
    loading: boolean;
    error: Error | null;
    update: (value: T) => Promise<void>;
    remove: () => Promise<void>;
  };
};

export default useStorage;
export { refresh, set, get, remove };
