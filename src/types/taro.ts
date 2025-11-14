/**
 * Taro 存储类型定义
 */

export interface TaroStorageResult<T = any> {
  data: T;
  errMsg: string;
}

export interface TaroStorageOptions {
  key: string;
}

export interface TaroSetStorageOptions<T = any> extends TaroStorageOptions {
  data: T;
}

export interface ITaroStorage {
  getStorage<T = any>(options: TaroStorageOptions): Promise<TaroStorageResult<T>>;
  setStorage<T = any>(options: TaroSetStorageOptions<T>): Promise<TaroStorageResult<void>>;
  removeStorage(options: TaroStorageOptions): Promise<TaroStorageResult<void>>;
  eventCenter: ITaroEventCenter;
  ENV_TYPE: {
    WEAPP: string;
    SWAN: string;
    ALIPAY: string;
    TT: string;
    QQ: string;
    JD: string;
    H5: string;
  };
}

export interface ITaroEventCenter {
  trigger(event: string, data?: any): void;
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}

export interface WxMiniProgram {
  removeStorageSync(key: string): void;
  setStorageSync(key: string, data: any): void;
  getStorageSync(key: string): any;
}

export interface GlobalWithWeapp {
  wx?: WxMiniProgram;
}

export interface WindowWithTaro {
  Taro?: ITaroStorage;
}