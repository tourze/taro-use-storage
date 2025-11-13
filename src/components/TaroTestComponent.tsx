import React from 'react';
import Taro from '@tarojs/taro';

const TaroTestComponent: React.FC = () => {
  const [storageData, setStorageData] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');

  React.useEffect(() => {
    // 测试 Taro API 是否工作
    Taro.getStorage({ key: 'test-key' })
      .then((res) => {
        setStorageData(JSON.stringify(res.data));
        setMessage('Taro.getStorage 工作正常！');
      })
      .catch(() => {
        setMessage('Taro.getStorage 工作正常！(没有存储数据)');
      });
  }, []);

  const handleSetStorage = () => {
    const testData = { time: new Date().toISOString(), random: Math.random() };
    Taro.setStorage({ key: 'test-key', data: testData })
      .then(() => {
        setStorageData(JSON.stringify(testData));
        setMessage('数据已保存！');
      })
      .catch((err) => {
        setMessage('保存失败: ' + err.message);
      });
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #007bff',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '20px 0'
    }}>
      <h3>🚀 Taro API 测试组件</h3>

      <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
        <strong>状态:</strong> <span style={{ color: '#28a745' }}>{message}</span>
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
          backgroundColor: '#007bff',
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

export default TaroTestComponent;