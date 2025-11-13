import React from 'react';

// Taro Mock Provider
export const TaroMockDecorator = (Story, context) => {
  // 确保 Taro mock 在组件渲染前可用
  const mockTaro = {
    getStorage: ({ key }) => {
      const value = localStorage.getItem(key);
      if (value) {
        return Promise.resolve({ data: JSON.parse(value) });
      }
      return Promise.reject(new Error('Storage not found'));
    },
    setStorage: ({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
      return Promise.resolve();
    },
    removeStorage: ({ key }) => {
      localStorage.removeItem(key);
      return Promise.resolve();
    },
    getStorageSync: (key) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : '';
    },
    setStorageSync: (key, data) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    removeStorageSync: (key) => {
      localStorage.removeItem(key);
    },
    eventCenter: {
      trigger: (event, data) => {
        window.dispatchEvent(new CustomEvent(event, { detail: data }));
      },
      on: (event, callback) => {
        window.addEventListener(event, callback);
      },
      off: (event, callback) => {
        window.removeEventListener(event, callback);
      },
    },
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

  // 设置全局 Taro
  window.Taro = mockTaro;
  global.Taro = mockTaro;

  // 模拟 require/import
  if (typeof window !== 'undefined') {
    (window as any).__TARO_MOCK__ = mockTaro;
  }

  return <Story {...context} />;
};