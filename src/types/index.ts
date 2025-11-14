/**
 * 类型定义导出
 */

export * from './taro';
export * from './storage';

// 重新导出常用类型
export type {
  StorageOptions,
  StorageReturn,
  StorageQuota,
  StorageSerializer,
  StorageConfig,
  StorageChangeEvent,
  StorageDataWithMeta,
  StorageStats,
  BatchOperation,
  StorageBatchResult
} from './storage';

export type {
  ITaroStorage,
  ITaroEventCenter,
  TaroStorageResult,
  TaroStorageOptions,
  TaroSetStorageOptions,
  WxMiniProgram,
  GlobalWithWeapp,
  WindowWithTaro
} from './taro';