import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CounterDemo } from './CounterDemo';

const meta: Meta<typeof CounterDemo> = {
  title: 'Hooks/useStorage/CounterDemo',
  component: CounterDemo,
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

export const WithInstructions: Story = {
  render: () => React.createElement('div', {}, [
    React.createElement('div', {
      key: 'instructions',
      style: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }
    }, [
      React.createElement('h4', { key: 'title' }, '计数器演示说明'),
      React.createElement('ul', {
        key: 'list',
        style: { margin: '10px 0', paddingLeft: '20px' }
      }, [
        React.createElement('li', { key: '1' }, '计数器数据使用 useStorage Hook 持久化存储'),
        React.createElement('li', { key: '2' }, '每次操作都会保存到本地存储中'),
        React.createElement('li', { key: '3' }, '刷新页面后数据不会丢失'),
        React.createElement('li', { key: '4' }, '支持多个组件间数据同步')
      ])
    ]),
    React.createElement(CounterDemo, { key: 'demo' })
  ]),
};