import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormInputGroupComponent } from '@zambon-dev/ui/library';
import { FormInputGroupBasicExample } from '../../examples/form-input-group/form-input-group-basic.example';
import { FormInputGroupTypesExample } from '../../examples/form-input-group/form-input-group-types.example';
import { FormInputGroupValidationExample } from '../../examples/form-input-group/form-input-group-validation.example';

const meta: Meta<FormInputGroupComponent> = {
  component: FormInputGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [FormInputGroupBasicExample, FormInputGroupTypesExample, FormInputGroupValidationExample],
    }),
  ],
  title: 'Library/Form Components/Form Input Group',
};
export default meta;
type Story = StoryObj<FormInputGroupComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-form-input-group-basic></example-form-input-group-basic>` }),
};

export const FieldTypes: Story = {
  render: () => ({ template: `<example-form-input-group-types></example-form-input-group-types>` }),
};

export const ValidationErrors: Story = {
  render: () => ({ template: `<example-form-input-group-validation></example-form-input-group-validation>` }),
};
