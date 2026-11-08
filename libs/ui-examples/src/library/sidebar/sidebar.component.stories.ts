import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { SidebarComponent } from '@zambon-dev/ui/library';
import { SidebarOverviewExample } from '../../examples/sidebar/sidebar-overview.example';

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  decorators: [moduleMetadata({ imports: [SidebarOverviewExample] })],
  title: 'Library/Sidebar/Sidebar',
};
export default meta;
type Story = StoryObj<SidebarComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-sidebar-overview></example-sidebar-overview>` }),
};
