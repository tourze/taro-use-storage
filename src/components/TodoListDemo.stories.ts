import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TodoListDemo } from './TodoListDemo';

const meta: Meta<typeof TodoListDemo> = {
  title: 'Hooks/useStorage/TodoListDemo',
  component: TodoListDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: any) => React.createElement('div', { style: { padding: '20px' } }, React.createElement(Story)),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithExplanation: Story = {
  render: () => React.createElement('div', {}, [
    React.createElement('div', {
      key: 'explanation',
      style: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f0f8f0',
        borderRadius: '8px',
        border: '1px solid #c3e6c3'
      }
    }, [
      React.createElement('h4', { key: 'title' }, '待办事项演示说明'),
      React.createElement('p', {
        key: 'description',
        style: { margin: '10px 0' }
      }, '这个演示展示了如何使用 useStorage Hook 来管理复杂的状态数据。'),
      React.createElement('ul', {
        key: 'list',
        style: { margin: '10px 0', paddingLeft: '20px' }
      }, [
        React.createElement('li', { key: '1' }, '支持数组的增删改查操作'),
        React.createElement('li', { key: '2' }, '自动保存到本地存储'),
        React.createElement('li', { key: '3' }, '支持数据持久化'),
        React.createElement('li', { key: '4' }, '支持复杂的对象结构'),
        React.createElement('li', { key: '5' }, '响应式数据更新')
      ])
    ]),
    React.createElement(TodoListDemo, { key: 'demo' })
  ]),
};