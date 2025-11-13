import React from 'react';
import useStorage from '../index';

export const CounterDemo: React.FC = () => {
  const { data, loading, update } = useStorage<number>('counter', 0);

  const increment = async () => {
    await update((data || 0) + 1);
  };

  const decrement = async () => {
    await update((data || 0) - 1);
  };

  const reset = async () => {
    await update(0);
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      maxWidth: '300px',
      margin: '20px 0',
      textAlign: 'center'
    }}>
      <h3>计数器演示</h3>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff' }}>
          {loading ? '...' : data || 0}
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          存储键: "counter"
        </div>
      </div>

      <div>
        <button
          onClick={decrement}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          -
        </button>

        <button
          onClick={increment}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          +
        </button>

        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          重置
        </button>
      </div>
    </div>
  );
};