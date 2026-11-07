import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGroupComponent, FormInputGroupComponent, FormService } from '@zambon-dev/ui/library';

/**
 * `validations` maps a validator's error key to its message. A message shows once the control is
 * touched and has that error.
 */
@Component({
  selector: 'example-form-input-group-validation',
  imports: [FormGroupComponent, FormInputGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-xl">
      <lib-form-group label="Validation state">
        <lib-form-input-group
          controlName="name"
          label="Name"
          [autofocus]="true"
          [validations]="{ required: 'Name is required' }"
        >
        </lib-form-input-group>
        <lib-form-input-group
          controlName="order"
          label="Order"
          type="number"
          [step]="1"
          [validations]="{ min: 'Order must be greater than zero' }"
        >
        </lib-form-input-group>
      </lib-form-group>
    </form>
  `,
})
export class FormInputGroupValidationExample {
  protected readonly form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    order: new FormControl<number | null>(0, { validators: [Validators.min(1)] }),
  });

  constructor() {
    // Shows the messages straight away. In a real form they appear as the user leaves each field.
    this.form.markAllAsTouched();
  }
}
