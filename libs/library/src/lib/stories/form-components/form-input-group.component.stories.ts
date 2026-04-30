import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormGroupComponent } from '../../components/form-group/form-group.component';
import { FormInputGroupComponent } from '../../components/form-input-group/form-input-group.component';

const meta: Meta<FormInputGroupComponent> = {
  component: FormInputGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormGroupComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  title: 'Form Components/Form Input Group',
};
export default meta;
type Story = StoryObj<FormInputGroupComponent>;

export const Primary: Story = {
  args: {
    autofocus: false,
    alignContent: 'center',
    controlName: 'name',
    format: undefined,
    label: 'Name',
    isDisabled: true,
    isFullHeight: false,
    maxLength: undefined,
    min: undefined,
    notes: '',
    readOnly: false,
    rows: undefined,
    showLabel: true,
    step: 1,
    type: 'text',
    validations: {},
  },
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        name: new FormControl<string>('Storybook field'),
      }),
    },
    template: `
      <form [formGroup]="form" class="p-4 max-w-md">
        <lib-form-group>
          <lib-form-input-group
            [autofocus]="autofocus"
            [alignContent]="alignContent"
            [controlName]="controlName"
            [format]="format"
            [label]="label"
            [isDisabled]="isDisabled"
            [isFullHeight]="isFullHeight"
            [maxLength]="maxLength"
            [min]="min"
            [notes]="notes"
            [readOnly]="readOnly"
            [rows]="rows"
            [showLabel]="showLabel"
            [step]="step"
            [type]="type"
            [validations]="validations">
          </lib-form-input-group>
        </lib-form-group>
      </form>
    `,
  }),
};

export const FieldTypes: Story = {
  render: () => ({
    props: {
      form: new FormGroup({
        description: new FormControl<string>('Monthly membership fee'),
        startDate: new FormControl<string>('2026-04-30'),
        amount: new FormControl<number | null>(149.9),
        active: new FormControl<boolean>(true),
        notes: new FormControl<string>('Visible in reports and audit history.'),
        scheduledAt: new FormControl<string>('2026-04-30T09:30'),
      }),
    },
    template: `
      <form [formGroup]="form" class="p-4 max-w-3xl">
        <lib-form-group label="Common field types">
          <lib-form-input-group controlName="description" label="Description" [maxLength]="100"></lib-form-input-group>
          <lib-form-input-group controlName="startDate" label="Start date" type="date" format="yyyy-MM-dd"></lib-form-input-group>
          <lib-form-input-group controlName="amount" label="Amount" type="number" [step]="0.01"></lib-form-input-group>
          <lib-form-input-group controlName="active" label="Active" type="checkbox"></lib-form-input-group>
          <lib-form-input-group controlName="notes" label="Notes" type="textarea" [rows]="3"></lib-form-input-group>
          <lib-form-input-group controlName="scheduledAt" label="Scheduled at" type="datetime-local"></lib-form-input-group>
        </lib-form-group>
      </form>
    `,
  }),
};

export const ValidationErrors: Story = {
  render: () => {
    const form = new FormGroup({
      name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      order: new FormControl<number | null>(0, { validators: [Validators.min(1)] }),
    });
    form.markAllAsTouched();

    return {
      props: { form },
      template: `
        <form [formGroup]="form" class="p-4 max-w-xl">
          <lib-form-group label="Validation state">
            <lib-form-input-group
              controlName="name"
              label="Name"
              [autofocus]="true"
              [validations]="{ required: 'Name is required' }">
            </lib-form-input-group>
            <lib-form-input-group
              controlName="order"
              label="Order"
              type="number"
              [step]="1"
              [validations]="{ min: 'Order must be greater than zero' }">
            </lib-form-input-group>
          </lib-form-group>
        </form>
      `,
    };
  },
};

