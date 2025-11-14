/**
 * @vibe-shell/use-storage
 * 为 Taro 应用程序提供本地存储和会话存储功能的 React Hook，支持多平台数据同步
 */

// 主要导出
export { useStorage, useStorageQuota, useStorageStats, useBatchStorage } from './hooks/useStorage';

// 工具函数导出
export {
  get,
  set,
  remove,
  refresh,
  exists,
  clear,
  getQuota,
  getStats,
  resetStats,
  batch,
  setWithTTL,
  getTTL,
  migrate,
  copy,
  exportData,
  importData,
  withCache
} from './utils';

// 核心类和函数导出
export { StorageManager, globalStorageManager, setGlobalStorageConfig } from './core/storage';
export { StorageEventEmitter, globalEventEmitter, triggerStorageChange, createNamespacedEventEmitter } from './core/events';
export { getTaroInstance, getWxInstance, detectEnvironment, checkStorageAvailability } from './core/taro';

// 类型导出
export type {
  StorageOptions,
  StorageReturn,
  StorageSerializer,
  StorageConfig,
  StorageChangeEvent,
  StorageDataWithMeta,
  StorageStats,
  StorageQuota,
  BatchOperation,
  StorageBatchResult,
  ITaroStorage,
  ITaroEventCenter,
  TaroStorageResult,
  TaroStorageOptions,
  TaroSetStorageOptions,
  WxMiniProgram,
  GlobalWithWeapp,
  WindowWithTaro
} from './types';

// 默认导出主 Hook
export { useStorage as default } from './hooks/useStorage';