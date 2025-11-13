// Taro Mock for Storybook
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
  // 同步版本的方法
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
  // 添加其他常用的 Taro API
  ENV_TYPE: {
    WEAPP: 'weapp',
    SWAN: 'swan',
    ALIPAY: 'alipay',
    TT: 'tt',
    QQ: 'qq',
    JD: 'jd',
    H5: 'h5'
  },
  // 当前环境
  ENV_TYPE: 'h5'
};

// 确保 mock 在全局可用
if (typeof window !== 'undefined') {
  window.Taro = mockTaro;
}
if (typeof global !== 'undefined') {
  global.Taro = mockTaro;
}

module.exports = mockTaro;
export default mockTaro;