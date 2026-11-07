import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { GroupScrollSpyComponent } from '@zambon-dev/ui/library';
import { GroupScrollSpyBasicExample } from '../../examples/group-scroll-spy/group-scroll-spy-basic.example';

const meta: Meta<GroupScrollSpyComponent> = {
  component: GroupScrollSpyComponent,
  decorators: [moduleMetadata({ imports: [GroupScrollSpyBasicExample] })],
  title: 'Library/Form Components/Group Scroll Spy',
};
export default meta;
type Story = StoryObj<GroupScrollSpyComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-group-scroll-spy-basic></example-group-scroll-spy-basic>` }),
};
