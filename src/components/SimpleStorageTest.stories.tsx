import type { Meta, StoryObj } from '@storybook/react-vite';
import SimpleStorageTest from './SimpleStorageTest';

const meta: Meta<typeof SimpleStorageTest> = {
  title: 'Test/SimpleStorageTest',
  component: SimpleStorageTest,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};