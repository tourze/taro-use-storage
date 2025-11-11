# @taro-aio/use-storage

React Hook to handle local and session storage in Taro applications.

## Installation

```bash
npm install @taro-aio/use-storage
# or
yarn add @taro-aio/use-storage
# or
pnpm add @taro-aio/use-storage
```

## Features

- 🎣 React Hooks based API
- 📱 Taro multi-platform support (WeChat Mini Program, H5, Alipay, etc.)
- 🔄 Automatic synchronization across components
- ⚡ Async/await support
- 🛡️ TypeScript support
- 🧪 Complete test coverage

## Usage

### Basic Usage

```typescript
import useStorage from '@taro-aio/use-storage';

function MyComponent() {
  const { data, loading, error, update, remove } = useStorage('user', { name: '', age: 0 });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>Name: {data.name}</Text>
      <Text>Age: {data.age}</Text>
      <Button onClick={() => update({ name: 'John', age: 25 })}>
        Update User
      </Button>
      <Button onClick={remove}>Remove User</Button>
    </View>
  );
}
```

### Utility Functions

```typescript
import { get, set, remove, refresh } from '@taro-aio/use-storage';

// Get value with default
const user = await get('user', { name: 'Anonymous' });

// Set value and trigger refresh
await set('user', { name: 'John', age: 25 });

// Remove value and trigger refresh
await remove('user');

// Manually trigger refresh for listeners
refresh('user');
```

## API

### useStorage(key, defaultValue)

Returns an object with the following properties:

- `data`: The current value from storage
- `loading`: Boolean indicating if data is being loaded
- `error`: Error object if loading failed
- `update`: Function to update the value in storage
- `remove`: Function to remove the value from storage

### Utility Functions

- `get(key, defaultValue)`: Get value from storage with default fallback
- `set(key, data)`: Set value in storage and trigger refresh
- `remove(key)`: Remove value from storage and trigger refresh
- `refresh(key)`: Trigger refresh event for listeners

## Platform Support

- ✅ WeChat Mini Program
- ✅ H5
- ✅ Alipay Mini Program
- ✅ ByteDance Mini Program
- ✅ QQ Mini Program

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build package
npm run build

# Lint code
npm run lint
```

## License

MIT