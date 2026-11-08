import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormGroupComponent } from '@zambon-dev/ui/library';
import { FormGroupOverviewExample } from '../../examples/form-group/form-group-overview.example';

const meta: Meta<FormGroupComponent> = {
  component: FormGroupComponent,
  decorators: [moduleMetadata({ imports: [FormGroupOverviewExample] })],
  title: 'Library/Form Components/Form Group',
};
export default meta;
type Story = StoryObj<FormGroupComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-form-group-overview></example-form-group-overview>` }),
};
