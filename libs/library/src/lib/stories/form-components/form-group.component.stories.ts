import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormGroupComponent } from '../../components/form-group/form-group.component';
import { FormInputGroupComponent } from '../../components/form-input-group/form-input-group.component';

const meta: Meta<FormGroupComponent> = {
  component: FormGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormInputGroupComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  title: 'Form Components/Form Group',
};
export default meta;
type Story = StoryObj<FormGroupComponent>;

export const Primary: Story = {
  args: {
    shouldExpand: false,
    label: 'Customer',
  },
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        name: new FormControl<string>('Ada Lovelace', { nonNullable: true, validators: [Validators.required] }),
        email: new FormControl<string>('ada@example.com', { nonNullable: true, validators: [Validators.email] }),
      }),
    },
    template: `
      <form [formGroup]="form" class="p-4 max-w-2xl">
        <lib-form-group
          [label]="label"
          [shouldExpand]="shouldExpand">
          <lib-form-input-group
            controlName="name"
            label="Name"
            [validations]="{ required: 'Name is required' }">
          </lib-form-input-group>
          <lib-form-input-group
            controlName="email"
            label="Email"
            notes="Used for notifications"
            [type]="'email'"
            [validations]="{ email: 'Invalid email' }">
          </lib-form-input-group>
        </lib-form-group>
      </form>
    `,
  }),
};

