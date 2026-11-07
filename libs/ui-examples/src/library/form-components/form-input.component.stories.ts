import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormInputComponent } from '@zambon-dev/ui/library';
import { FormInputBasicExample } from '../../examples/form-input/form-input-basic.example';

const meta: Meta<FormInputComponent> = {
  component: FormInputComponent,
  decorators: [moduleMetadata({ imports: [FormInputBasicExample] })],
  title: 'Library/Form Components/Form Input',
};
export default meta;
type Story = StoryObj<FormInputComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-form-input-basic></example-form-input-basic>` }),
};
