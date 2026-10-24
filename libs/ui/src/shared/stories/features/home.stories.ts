import type { Meta, StoryObj } from '@storybook/angular';
import { HomeComponent } from '../../features/home/home.component';

const meta: Meta<HomeComponent> = {
  component: HomeComponent,
  title: 'Shared/Home',
};
export default meta;
type Story = StoryObj<HomeComponent>;

export const Primary: Story = {};
