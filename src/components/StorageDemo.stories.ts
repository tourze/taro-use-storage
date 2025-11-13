import type { Meta, StoryObj } from '@storybook/react-vite';
import { StorageDemo } from './StorageDemo';

const meta: Meta<typeof StorageDemo> = {
  title: 'Hooks/useStorage/StorageDemo',
  component: StorageDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    storageKey: {
      control: 'text',
      description: '存储的键名',
    },
    defaultValue: {
      control: 'text',
      description: '默认值',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StringStorage: Story = {
  args: {
    storageKey: 'demo-string',
    defaultValue: 'Hello, World!',
  },
};

export const NumberStorage: Story = {
  args: {
    storageKey: 'demo-number',
    defaultValue: 42,
  },
};

export const ObjectStorage: Story = {
  args: {
    storageKey: 'demo-object',
    defaultValue: {
      name: '张三',
      age: 25,
      city: '北京',
    },
  },
};

export const ArrayStorage: Story = {
  args: {
    storageKey: 'demo-array',
    defaultValue: ['苹果', '香蕉', '橙子'],
  },
};

export const NoDefault: Story = {
  args: {
    storageKey: 'demo-no-default',
  },
};