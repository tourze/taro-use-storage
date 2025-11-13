import React from 'react';
import useStorage from '../index';

interface StorageDemoProps {
  storageKey: string;
  defaultValue?: any;
}

export const StorageDemo: React.FC<StorageDemoProps> = ({
  storageKey,
  defaultValue = null
}) => {
  const { data, loading, error, update, remove } = useStorage(storageKey, defaultValue);

  const [inputValue, setInputValue] = React.useState('');

  const handleUpdate = async () => {
    try {
      await update(inputValue);
      setInputValue('');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleRemove = async () => {
    try {
      await remove();
      setInputValue('');
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '20px 0'
    }}>
      <h3>Storage Demo - Key: "{storageKey}"</h3>

      <div style={{ marginBottom: '15px' }}>
        <strong>状态:</strong>
        {loading && <span style={{ color: 'blue' }}> 加载中...</span>}
        {error && error.message === 'Storage not found' &&
          <span style={{ color: 'orange' }}> 暂无数据，请输入内容并点击更新</span>}
        {error && error.message !== 'Storage not found' &&
          <span style={{ color: 'red' }}> 错误: {error.message}</span>}
        {!loading && !error && <span style={{ color: 'green' }}> 已加载</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>当前值:</strong>
        <pre style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入新值"
          style={{
            padding: '8px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '200px'
          }}
        />
        <button
          onClick={handleUpdate}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          更新
        </button>
        <button
          onClick={handleRemove}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          删除
        </button>
      </div>
    </div>
  );
};