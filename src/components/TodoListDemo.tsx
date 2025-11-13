import React, { useState } from 'react';
import useStorage from '../index';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

export const TodoListDemo: React.FC = () => {
  const { data: todos = [], loading, update } = useStorage<Todo[]>('todos', []);
  const [newTodoText, setNewTodoText] = useState('');

  const addTodo = async () => {
    if (!newTodoText.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    await update([...todos, newTodo]);
    setNewTodoText('');
  };

  const toggleTodo = async (id: number) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    await update(updatedTodos);
  };

  const deleteTodo = async (id: number) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    await update(updatedTodos);
  };

  const clearCompleted = async () => {
    const activeTodos = todos.filter(todo => !todo.completed);
    await update(activeTodos);
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      maxWidth: '500px',
      margin: '20px 0'
    }}>
      <h3>待办事项演示</h3>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="输入新的待办事项..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={addTodo}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            添加
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
          <span>活跃: {activeCount}</span>
          <span>已完成: {completedCount}</span>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              style={{
                background: 'none',
                border: '1px solid #dc3545',
                color: '#dc3545',
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              清除已完成
            </button>
          )}
        </div>
      </div>

      <div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#666' }}>加载中...</div>
        ) : todos.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            暂无待办事项
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: todo.completed ? '#f8f9fa' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  style={{ marginRight: '10px' }}
                />
                <span
                  style={{
                    flex: 1,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#999' : 'black'
                  }}
                >
                  {todo.text}
                </span>
                <span style={{ fontSize: '12px', color: '#999', marginRight: '10px' }}>
                  {new Date(todo.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};