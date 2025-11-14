/**
 * 存储 Hook 和相关功能的类型定义
 */

export interface StorageSerializer {
  stringify: (data: any) => string;
  parse: (str: string) => any;
}

export interface StorageOptions<T = any> {
  /** 默认值 */
  defaultValue?: T | null;
  /** 存储类型 */
  type?: 'local' | 'session';
  /** 是否同步到其他实例 */
  sync?: boolean;
  /** 过期时间（毫秒） */
  ttl?: number;
  /** 自定义序列化器 */
  serializer?: StorageSerializer;
  /** 数据验证函数 */
  validator?: (data: T) => boolean;
  /** 数据转换函数 */
  transformer?: (data: T) => T;
  /** 错误处理函数 */
  onError?: (error: Error) => void;
}

export interface StorageDataWithMeta<T> {
  data: T;
  timestamp: number;
  ttl?: number;
  version?: string;
}

export interface StorageReturn<T> {
  /** 当前数据 */
  data: T | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 更新数据 */
  update: (value: T) => Promise<void>;
  /** 删除数据 */
  remove: () => Promise<void>;
  /** 刷新数据 */
  refresh: () => void;
  /** 检查数据是否存在 */
  exists: boolean;
  /** 数据最后更新时间 */
  lastUpdated: number | null;
  /** 是否已过期 */
  isExpired: boolean;
}

export interface StorageQuota {
  /** 总配额（字节） */
  quota: number;
  /** 已使用（字节） */
  usage: number;
  /** 剩余配额（字节） */
  available: number;
  /** 使用率（百分比） */
  usagePercentage: number;
}

export interface BatchOperation<T = any> {
  key: string;
  value?: T;
  operation: 'set' | 'remove' | 'get';
}

export interface StorageBatchResult<T = any> {
  key: string;
  success: boolean;
  data?: T;
  error?: Error;
}

export interface StorageStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageOperationTime: number;
  lastOperationTime: number;
}

export interface StorageConfig {
  /** 全局错误处理 */
  onError?: (error: Error, operation: string, key?: string) => void;
  /** 全局序列化器 */
  serializer?: StorageSerializer;
  /** 是否启用调试日志 */
  debug?: boolean;
  /** 操作超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retryAttempts?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}

export interface StorageChangeEvent<T = any> {
  key: string;
  value?: T;
  operation: 'set' | 'remove' | 'clear';
  timestamp: number;
  source?: string;
}