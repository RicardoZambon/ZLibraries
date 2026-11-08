import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { MultiSelectComponent } from '@zambon-dev/ui/library';
import { MultiSelectBasicExample } from '../../examples/multi-select/multi-select-basic.example';

const meta: Meta<MultiSelectComponent> = {
  component: MultiSelectComponent,
  decorators: [moduleMetadata({ imports: [MultiSelectBasicExample] })],
  title: 'Library/Modals/Multi Select',
};
export default meta;
type Story = StoryObj<MultiSelectComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-multi-select-basic></example-multi-select-basic>` }),
};

export const CompactSelector: Story = {
  render: () => ({
    template: `<example-multi-select-basic modalSize="3xl" modalTitle="Select assignees"></example-multi-select-basic>`,
  }),
};

export const WidePermissionSelector: Story = {
  render: () => ({
    template: `<example-multi-select-basic modalSize="7xl" modalTitle="Select permissions"></example-multi-select-basic>`,
  }),
};
