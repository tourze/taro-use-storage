# @vibe-shell/use-storage

[![npm version](https://badge.fury.io/js/%40vibe-shell%2Fuse-storage.svg)](https://badge.fury.io/js/%40vibe-shell%2Fuse-storage)
[![codecov](https://codecov.io/gh/tourze/taro-use-storage/branch/master/graph/badge.svg)](https://codecov.io/gh/tourze/taro-use-storage)
[![Build Status](https://github.com/tourze/taro-use-storage/workflows/CI/badge.svg)](https://github.com/tourze/taro-use-storage/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

为 Taro 应用程序提供强大的本地存储和会话存储功能的 React Hook，支持多平台数据同步。

## ✨ 特性

- 🎣 基于 React Hooks 的现代 API
- 📱 Taro 多平台支持（微信小程序、H5、支付宝小程序、百度小程序等）
- 🔄 组件间自动同步和状态管理
- ⚡ 高性能异步操作支持
- 🛡️ 完整的 TypeScript 类型支持
- 🧪 全面的测试覆盖
- 📚 Storybook 文档和交互式演示
- 🎯 支持 TTL（生存时间）自动过期
- 📦 批量操作功能
- 📈 性能监控和统计
- 🔧 数据验证和转换
- 🛡️ 错误处理和重试机制

## 安装

```bash
npm install @vibe-shell/use-storage
# 或
yarn add @vibe-shell/use-storage
# 或
pnpm add @vibe-shell/use-storage
```

## 🚀 基本使用

```typescript
import useStorage from '@vibe-shell/use-storage';

function MyComponent() {
  const { data, loading, error, update, remove, exists, isExpired } = useStorage('user', { name: '', age: 0 });

  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error.message}</Text>;

  return (
    <View>
      <Text>姓名: {data.name}</Text>
      <Text>年龄: {data.age}</Text>
      <Text>状态: {exists ? (isExpired ? '已过期' : '正常') : '不存在'}</Text>
      <Button onClick={() => update({ name: '张三', age: 25 })}>
        更新用户
      </Button>
      <Button onClick={remove}>删除用户</Button>
    </View>
  );
}
```

## 🔧 高级用法

### 带过期时间的存储

```typescript
function SessionData() {
  const { data, update, isExpired } = useStorage('session', null, {
    ttl: 60000, // 1分钟后过期
    transformer: (data) => ({ ...data, timestamp: Date.now() })
  });

  const handleLogin = (userData) => {
    update(userData); // 1分钟后自动过期
  };

  return (
    <View>
      {isExpired ? (
        <Text>会话已过期，请重新登录</Text>
      ) : (
        <Text>欢迎, {data?.name}</Text>
      )}
    </View>
  );
}
```

### 数据验证和转换

```typescript
function UserProfile() {
  const { data, update, error } = useStorage('profile', {
    name: '',
    email: '',
    age: 0
  }, {
    validator: (data) => {
      return data.name.length > 0 &&
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
             data.age >= 0 && data.age <= 150;
    },
    transformer: (data) => ({
      ...data,
      updatedAt: new Date().toISOString()
    }),
    onError: (error) => console.error('存储错误:', error)
  });

  return (
    <View>
      {error && <Text style={{color: 'red'}}>{error.message}</Text>}
      <Text>姓名: {data.name}</Text>
      <Text>邮箱: {data.email}</Text>
      <Text>更新时间: {data.updatedAt}</Text>
    </View>
  );
}
```

### 批量操作

```typescript
import { useBatchStorage } from '@vibe-shell/use-storage';

function BatchOperations() {
  const { execute, loading, error } = useBatchStorage();

  const handleBatchUpdate = async () => {
    const operations = [
      { key: 'user.name', operation: 'set' as const, value: '张三' },
      { key: 'user.age', operation: 'set' as const, value: 25 },
      { key: 'temp.data', operation: 'remove' as const },
      { key: 'settings', operation: 'get' as const }
    ];

    try {
      const results = await execute(operations);
      console.log('批量操作结果:', results);
    } catch (err) {
      console.error('批量操作失败:', err);
    }
  };

  return (
    <Button onClick={handleBatchUpdate} disabled={loading}>
      {loading ? '处理中...' : '批量更新'}
    </Button>
  );
}
```

### 存储配额监控

```typescript
import { useStorageQuota } from '@vibe-shell/use-storage';

function StorageMonitor() {
  const quota = useStorageQuota();

  if (!quota) {
    return <Text>当前环境不支持配额检测</Text>;
  }

  return (
    <View>
      <Text>存储使用情况:</Text>
      <Text>已使用: {(quota.usage / 1024 / 1024).toFixed(2)} MB</Text>
      <Text>总配额: {(quota.quota / 1024 / 1024).toFixed(2)} MB</Text>
      <Text>使用率: {quota.usagePercentage.toFixed(1)}%</Text>
      {quota.usagePercentage > 80 && (
        <Text style={{color: 'red'}}>存储空间即将用完！</Text>
      )}
    </View>
  );
}
```

## 🛠️ 工具函数

```typescript
import {
  get,
  set,
  remove,
  refresh,
  exists,
  clear,
  batch,
  setWithTTL,
  getTTL,
  migrate,
  copy,
  exportData,
  importData,
  withCache
} from '@vibe-shell/use-storage';

// 基础操作
const value = await get('myKey', '默认值');
await set('myKey', { name: 'value' });
await remove('myKey');
const hasKey = await exists('myKey');

// TTL 操作
await setWithTTL('session', userData, 60000); // 1分钟过期
const remainingTime = await getTTL('session');

// 批量操作
const results = await batch([
  { key: 'user.name', operation: 'set', value: '张三' },
  { key: 'user.age', operation: 'set', value: 25 },
  { key: 'temp', operation: 'remove' }
]);

// 数据迁移
await migrate('oldKey', 'newKey'); // 重命名键
await copy('sourceKey', 'targetKey'); // 复制数据

// 导入导出
const data = await exportData(['user', 'settings']);
await importData(data, { overwrite: true });

// 缓存装饰器
const expensiveFunction = async (id: string) => {
  // 耗时的计算或网络请求
  return fetchUserData(id);
};

const cachedFunction = withCache(
  expensiveFunction,
  (id) => `user:${id}`,
  300000 // 5分钟缓存
);

const userData = await cachedFunction('123');
```

## Storybook 文档

本项目包含完整的 Storybook 文档和演示，帮助你更好地理解和使用 useStorage Hook。

### 启动 Storybook

```bash
# 开发模式
npm run storybook

# 构建静态版本
npm run build-storybook
```

### 演示组件

1. **StorageDemo**: 基础存储演示，支持字符串、数字、对象和数组
2. **CounterDemo**: 计数器演示，展示数值类型的持久化存储
3. **TodoListDemo**: 待办事项演示，展示复杂对象数组的存储管理

### 在线查看

启动 Storybook 后，访问 http://localhost:6006 查看完整的交互式文档和示例。

## API 参考

### useStorage Hook

```typescript
const { data, loading, error, update, remove } = useStorage<T>(
  key: string,
  defaultValue: T | null = null
);
```

**参数:**
- `key`: 存储键名
- `defaultValue`: 默认值（可选）

**返回值:**
- `data`: 当前存储的值
- `loading`: 是否正在加载
- `error`: 错误信息
- `update`: 更新值的函数
- `remove`: 删除值的函数

### 工具函数

- `get(key, defaultValue?)`: 获取存储值
- `set(key, data)`: 设置存储值
- `remove(key)`: 删除存储值
- `refresh(key)`: 刷新存储值（通知其他组件）

## Storybook 示例

Storybook 包含以下交互式示例：

- **存储演示**: 测试不同数据类型（字符串、数字、对象、数组）
- **计数器演示**: 带增减功能的持久化计数器
- **待办清单演示**: 完整的待办事项管理，支持添加、删除和完成操作

## 📚 Storybook 文档

本项目包含完整的 Storybook 文档和演示，帮助你更好地理解和使用 useStorage Hook。

### 启动 Storybook

```bash
# 开发模式
npm run storybook

# 构建静态版本
npm run build-storybook
```

### 在线查看

启动 Storybook 后，访问 http://localhost:6006 查看完整的交互式文档和示例。

## 🎯 实际使用场景

### 1. 用户偏好设置

```typescript
function Settings() {
  const { data: theme, update } = useStorage('theme', 'light', {
    ttl: 7 * 24 * 60 * 60 * 1000 // 7天过期
  });

  return (
    <View>
      <Button onClick={() => update('dark')}>深色模式</Button>
      <Button onClick={() => update('light')}>浅色模式</Button>
      <Text>当前主题: {theme}</Text>
    </View>
  );
}
```

### 2. 购物车管理

```typescript
function ShoppingCart() {
  const { data: cartItems, update, exists } = useStorage('cart', [], {
    validator: (items) => Array.isArray(items) && items.length <= 99,
    transformer: (items) => items.map(item => ({
      ...item,
      updatedAt: Date.now()
    }))
  });

  const addToCart = (item) => {
    if (cartItems.length >= 99) {
      Taro.showToast({ title: '购物车已满', icon: 'none' });
      return;
    }
    update([...cartItems, { ...item, id: Date.now() }]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <View>
      <Text>购物车 ({cartItems.length} 件商品)</Text>
      <Text>总价: ¥{getTotalPrice()}</Text>
      {cartItems.map(item => (
        <CartItem key={item.id} item={item} onUpdate={update} items={cartItems} />
      ))}
      {cartItems.length === 0 && !exists && <Text>购物车为空</Text>}
    </View>
  );
}
```

### 3. 表单草稿自动保存

```typescript
function DraftForm() {
  const { data: formData, update, remove, isExpired } = useStorage('formDraft', {
    title: '',
    content: '',
    tags: []
  }, {
    ttl: 24 * 60 * 60 * 1000, // 24小时过期
    transformer: (data) => ({
      ...data,
      lastSaved: Date.now()
    })
  });

  // 自动保存
  const debouncedUpdate = useMemo(
    () => debounce(update, 1000),
    [update]
  );

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    update(newData);
    debouncedUpdate(newData);
  };

  const submitForm = async () => {
    try {
      await submitArticle(formData);
      remove(); // 清除草稿
      Taro.showToast({ title: '发布成功' });
    } catch (error) {
      Taro.showToast({ title: '发布失败', icon: 'none' });
    }
  };

  return (
    <View>
      {isExpired && (
        <Text style={{color: 'orange'}}>草稿已过期，请重新编辑</Text>
      )}
      <Input
        value={formData.title || ''}
        onInput={(e) => handleInputChange('title', e.detail.value)}
        placeholder="请输入标题"
      />
      <Textarea
        value={formData.content || ''}
        onInput={(e) => handleInputChange('content', e.detail.value)}
        placeholder="请输入内容"
      />
      <Button onClick={submitForm}>发布文章</Button>
    </View>
  );
}
```

### 4. 离线数据缓存

```typescript
function OfflineDataSync() {
  const { data: cachedData, update, isExpired } = useStorage('cachedData', null, {
    ttl: 5 * 60 * 1000, // 5分钟缓存
    validator: (data) => data && data.version === API_VERSION
  });

  const syncData = async () => {
    try {
      const latestData = await fetchLatestData();
      update(latestData);
      Taro.showToast({ title: '数据已同步' });
    } catch (error) {
      if (cachedData && !isExpired) {
        Taro.showToast({ title: '使用离线数据', icon: 'none' });
      } else {
        Taro.showToast({ title: '数据同步失败', icon: 'none' });
      }
    }
  };

  return (
    <View>
      <Button onClick={syncData}>同步数据</Button>
      {cachedData && (
        <Text>
          最后更新: {new Date(cachedData.lastUpdated).toLocaleString()}
          {isExpired && ' (数据已过期)'}
        </Text>
      )}
    </View>
  );
}
```

## ⚙️ 开发

```bash
# 安装依赖
npm install

# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix

# 类型检查
npm run type-check

# 运行 Storybook
npm run storybook

# 构建 Storybook
npm run build-storybook

# 构建生产版本
npm run build

# 分析包大小
npm run build:analyze

# 清理构建文件
npm run clean
```

## ⚠️ 注意事项

1. **存储限制**: 小程序有存储大小限制（通常为 10MB）
2. **数据同步**: 在多个组件中使用相同键名时，数据会自动同步
3. **错误处理**: Hook 内部已包含错误处理，但建议根据需要添加额外的错误处理逻辑
4. **类型安全**: 使用 TypeScript 时，建议明确指定泛型类型
5. **性能考虑**: 频繁的存储操作可能影响性能，建议使用防抖或批量操作
6. **数据安全**: 敏感数据不建议存储在客户端本地存储中

## 🔧 故障排除

### 常见问题

1. **数据不同步**: 检查组件是否使用了相同的键名
2. **TypeScript 错误**: 确保正确安装了类型定义
3. **存储失败**: 检查存储空间是否已满
4. **数据过期**: 检查 TTL 设置是否合理

### 调试技巧

```typescript
// 启用调试模式
import { setGlobalStorageConfig } from '@vibe-shell/use-storage';

setGlobalStorageConfig({
  debug: true,
  onError: (error, operation, key) => {
    console.error(`存储操作失败: ${operation}`, error, key);
  }
});
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT