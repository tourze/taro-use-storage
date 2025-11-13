# @vibe-shell/use-storage

为 Taro 应用程序提供本地存储和会话存储功能的 React Hook，支持多平台数据同步。

## 特性

- 🎣 基于 React Hooks 的 API
- 📱 Taro 多平台支持（微信小程序、H5、支付宝小程序等）
- 🔄 组件间自动同步
- ⚡ 异步/等待支持
- 🛡️ TypeScript 支持
- 🧪 完整的测试覆盖
- 📚 Storybook 文档和演示

## 安装

```bash
npm install @vibe-shell/use-storage
# 或
yarn add @vibe-shell/use-storage
# 或
pnpm add @vibe-shell/use-storage
```

## 基本使用

```typescript
import useStorage from '@vibe-shell/use-storage';

function MyComponent() {
  const { data, loading, error, update, remove } = useStorage('user', { name: '', age: 0 });

  if (loading) return <Text>加载中...</Text>;
  if (error) return <Text>错误: {error.message}</Text>;

  return (
    <View>
      <Text>姓名: {data.name}</Text>
      <Text>年龄: {data.age}</Text>
      <Button onClick={() => update({ name: '张三', age: 25 })}>
        更新用户
      </Button>
      <Button onClick={remove}>删除用户</Button>
    </View>
  );
}
```

## 工具函数

```typescript
import { get, set, remove, refresh } from '@vibe-shell/use-storage';

// 获取存储值
const value = await get('myKey', '默认值');

// 设置存储值
await set('myKey', { name: 'value' });

// 删除存储值
await remove('myKey');

// 刷新存储值（触发其他使用相同键的组件更新）
refresh('myKey');
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

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 运行 Storybook
npm run storybook

# 构建生产版本
npm run build
```

## 使用场景

### 1. 用户偏好设置
```typescript
function Settings() {
  const { data: theme, update } = useStorage('theme', 'light');

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
  const { data: cartItems, update } = useStorage('cart', []);

  const addToCart = (item) => {
    update([...cartItems, { ...item, id: Date.now() }]);
  };

  const removeFromCart = (itemId) => {
    update(cartItems.filter(item => item.id !== itemId));
  };

  return (
    <View>
      {cartItems.map(item => (
        <View key={item.id}>
          <Text>{item.name}</Text>
          <Button onClick={() => removeFromCart(item.id)}>删除</Button>
        </View>
      ))}
    </View>
  );
}
```

### 3. 表单草稿保存
```typescript
function DraftForm() {
  const { data: formData, update, remove } = useStorage('formDraft', {});

  const handleInputChange = (field, value) => {
    update({ ...formData, [field]: value });
  };

  const submitForm = () => {
    // 提交表单
    remove(); // 清除草稿
  };

  return (
    <View>
      <Input
        value={formData.title || ''}
        onChange={(e) => handleInputChange('title', e.target.value)}
        placeholder="标题"
      />
      <Input
        value={formData.content || ''}
        onChange={(e) => handleInputChange('content', e.target.value)}
        placeholder="内容"
      />
      <Button onClick={submitForm}>提交</Button>
    </View>
  );
}
```

## 注意事项

1. **存储限制**: 小程序有存储大小限制（通常为 10MB）
2. **数据同步**: 在多个组件中使用相同键名时，数据会自动同步
3. **错误处理**: Hook 内部已包含错误处理，但建议根据需要添加额外的错误处理逻辑
4. **类型安全**: 使用 TypeScript 时，建议明确指定泛型类型

## 许可证

MIT