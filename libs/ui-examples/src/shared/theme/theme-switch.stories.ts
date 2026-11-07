import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ThemeSwitchComponent } from '@zambon-dev/ui/shared';
import { ThemeSwitchBasicExample } from '../../examples/theme-switch/theme-switch-basic.example';

const meta: Meta<ThemeSwitchComponent> = {
  component: ThemeSwitchComponent,
  decorators: [moduleMetadata({ imports: [ThemeSwitchBasicExample] })],
  title: 'Shared/Theme Switch',
};
export default meta;
type Story = StoryObj<ThemeSwitchComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-theme-switch-basic></example-theme-switch-basic>` }),
};
