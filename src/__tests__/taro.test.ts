/**
 * Taro 兼容层测试
 */

import { getTaroInstance, getWxInstance, detectEnvironment, checkStorageAvailability } from '../core/taro';

describe('Taro 兼容层', () => {
  describe('getTaroInstance', () => {
    const originalRequire = global.require;

    beforeEach(() => {
      jest.resetModules();
      delete (global as any).window;
      delete (global as any).global;
    });

    afterEach(() => {
      global.require = originalRequire;
    });

    test('应该从 @tarojs/taro 模块获取实例', () => {
      const mockTaro = {
        getStorage: jest.fn(),
        setStorage: jest.fn(),
        removeStorage: jest.fn(),
        eventCenter: {
          trigger: jest.fn(),
          on: jest.fn(),
          off: jest.fn()
        },
        ENV_TYPE: {
          WEAPP: 'weapp',
          H5: 'h5'
        }
      };

      const mockRequire = jest.fn().mockReturnValue(mockTaro);
      global.require = mockRequire;

      const taro = getTaroInstance();

      expect(mockRequire).toHaveBeenCalledWith('@tarojs/taro');
      expect(taro).toEqual(mockTaro);
    });

    test('应该从 window.Taro 获取实例', () => {
      const mockTaro = {
        getStorage: jest.fn(),
        setStorage: jest.fn(),
        removeStorage: jest.fn(),
        eventCenter: {
          trigger: jest.fn(),
          on: jest.fn(),
          off: jest.fn()
        },
        ENV_TYPE: {
          WEAPP: 'weapp',
          H5: 'h5'
        }
      };

      global.require = jest.fn().mockImplementation(() => {
        throw new Error('Module not found');
      });

      (global as any).window = { Taro: mockTaro };

      const taro = getTaroInstance();

      expect(taro).toEqual(mockTaro);
    });

    test('应该返回 fallback 实现', () => {
      global.require = jest.fn().mockImplementation(() => {
        throw new Error('Module not found');
      });

      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };

      (global as any).window = {
        localStorage: mockLocalStorage,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };

      const taro = getTaroInstance();

      expect(taro).toHaveProperty('getStorage');
      expect(taro).toHaveProperty('setStorage');
      expect(taro).toHaveProperty('removeStorage');
      expect(taro).toHaveProperty('eventCenter');
      expect(taro).toHaveProperty('ENV_TYPE');
    });
  });

  describe('getWxInstance', () => {
    test('应该返回微信小程序实例', () => {
      const mockWx = {
        removeStorageSync: jest.fn(),
        setStorageSync: jest.fn(),
        getStorageSync: jest.fn()
      };

      (global as any).global = { wx: mockWx };

      const wx = getWxInstance();

      expect(wx).toEqual(mockWx);
    });

    test('在没有微信实例时返回 undefined', () => {
      (global as any).global = {};

      const wx = getWxInstance();

      expect(wx).toBeUndefined();
    });
  });

  describe('detectEnvironment', () => {
    const originalEnv = process.env.TARO_ENV;

    afterEach(() => {
      process.env.TARO_ENV = originalEnv;
    });

    test('应该返回 process.env.TARO_ENV', () => {
      process.env.TARO_ENV = 'weapp';

      const env = detectEnvironment();

      expect(env).toBe('weapp');
    });

    test('应该检测微信小程序环境', () => {
      delete process.env.TARO_ENV;
      (global as any).global = { wx: {} };

      const env = detectEnvironment();

      expect(env).toBe('weapp');
    });

    test('应该检测 H5 环境', () => {
      delete process.env.TARO_ENV;
      (global as any).global = {};
      (global as any).window = {};

      const env = detectEnvironment();

      expect(env).toBe('h5');
    });

    test('应该默认返回 h5', () => {
      delete process.env.TARO_ENV;
      (global as any).global = {};
      delete (global as any).window;

      const env = detectEnvironment();

      expect(env).toBe('h5');
    });
  });

  describe('checkStorageAvailability', () => {
    test('应该检测可用的存储 API', () => {
      const mockTaro = {
        getStorage: jest.fn(),
        setStorage: jest.fn(),
        removeStorage: jest.fn(),
        eventCenter: {
          trigger: jest.fn(),
          on: jest.fn(),
          off: jest.fn()
        },
        ENV_TYPE: {
          WEAPP: 'weapp',
          H5: 'h5'
        }
      };

      global.require = jest.fn().mockReturnValue(mockTaro);
      process.env.TARO_ENV = 'h5';

      const availability = checkStorageAvailability();

      expect(availability.available).toBe(true);
      expect(availability.type).toBe('h5');
      expect(availability.error).toBeUndefined();
    });

    test('应该检测不可用的存储 API', () => {
      global.require = jest.fn().mockImplementation(() => {
        throw new Error('Storage not available');
      });
      process.env.TARO_ENV = 'h5';

      const availability = checkStorageAvailability();

      expect(availability.available).toBe(false);
      expect(availability.type).toBe('h5');
      expect(availability.error).toBe('Storage not available');
    });
  });
});