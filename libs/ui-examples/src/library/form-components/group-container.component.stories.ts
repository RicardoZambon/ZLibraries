import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { GroupContainerComponent } from '@zambon-dev/ui/library';
import { GroupContainerLoadingExample } from '../../examples/group-container/group-container-loading.example';
import { GroupContainerOverviewExample } from '../../examples/group-container/group-container-overview.example';

const meta: Meta<GroupContainerComponent> = {
  component: GroupContainerComponent,
  decorators: [moduleMetadata({ imports: [GroupContainerLoadingExample, GroupContainerOverviewExample] })],
  title: 'Library/Form Components/Group Container',
};
export default meta;
type Story = StoryObj<GroupContainerComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-group-container-overview></example-group-container-overview>` }),
};

export const WithoutHeader: Story = {
  render: () => ({ template: `<example-group-container-loading></example-group-container-loading>` }),
};
