import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

// 简单的测试组件
const TestComponent: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>测试组件</h3>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
};

const meta: Meta<typeof TestComponent> = {
  title: 'Test/TestComponent',
  component: TestComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};