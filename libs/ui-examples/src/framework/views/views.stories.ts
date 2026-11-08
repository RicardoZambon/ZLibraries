import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TabsComponent } from '@zambon-dev/ui/framework';
import { TabsBreadcrumbsExample } from '../../examples/tabs/tabs-breadcrumbs.example';

const meta: Meta<TabsComponent> = {
  component: TabsComponent,
  decorators: [moduleMetadata({ imports: [TabsBreadcrumbsExample] })],
  title: 'Framework/Views',
};
export default meta;
type Story = StoryObj<TabsComponent>;

export const TabsWithBreadcrumbs: Story = {
  render: () => ({ template: `<example-tabs-breadcrumbs></example-tabs-breadcrumbs>` }),
};
