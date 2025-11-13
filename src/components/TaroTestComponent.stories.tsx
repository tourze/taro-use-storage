import type { Meta, StoryObj } from '@storybook/react-vite';
import TaroTestComponent from './TaroTestComponent';

const meta: Meta<typeof TaroTestComponent> = {
  title: 'Test/TaroTestComponent',
  component: TaroTestComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};