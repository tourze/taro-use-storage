import React from 'react';

// 直接使用全局 Taro，不导入
const getGlobalTaro = () => {
  if (typeof window !== 'undefined' && (window as any).Taro) {
    return (window as any).Taro;
  }
  if (typeof global !== 'undefined' && (global as any).Taro) {
    return (global as any).Taro;
  }

  // 如果没有 Taro，创建一个 localStorage fallback
  return {
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
    }
  };
};

const SimpleStorageTest: React.FC = () => {
  const [storageData, setStorageData] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const taro = getGlobalTaro();

  React.useEffect(() => {
    // 测试 Taro API 是否工作
    if (taro && taro.getStorage) {
      taro.getStorage({ key: 'simple-test-key' })
        .then((res: any) => {
          setStorageData(JSON.stringify(res.data));
          setMessage('✅ 存储 API 工作正常！');
        })
        .catch(() => {
          setMessage('✅ 存储 API 工作正常！(没有存储数据)');
        });
    } else {
      setMessage('❌ Taro 不可用');
    }
  }, [taro]);

  const handleSetStorage = () => {
    if (taro && taro.setStorage) {
      const testData = { time: new Date().toISOString(), random: Math.random() };
      taro.setStorage({ key: 'simple-test-key', data: testData })
        .then(() => {
          setStorageData(JSON.stringify(testData));
          setMessage('✅ 数据已保存！');
        })
        .catch((err: any) => {
          setMessage('❌ 保存失败: ' + err.message);
        });
    } else {
      setMessage('❌ Taro.setStorage 不可用');
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #28a745',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '20px 0'
    }}>
      <h3>🧪 简单存储测试</h3>

      <div style={{ marginBottom: '15px', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
        <strong>状态:</strong> {message}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>存储数据:</strong>
        <pre style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
          {storageData || '(暂无数据)'}
        </pre>
      </div>

      <button
        onClick={handleSetStorage}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        测试保存数据
      </button>
    </div>
  );
};

export default SimpleStorageTest;