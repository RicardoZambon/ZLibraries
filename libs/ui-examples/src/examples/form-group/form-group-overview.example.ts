import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGroupComponent, FormInputGroupComponent, FormService } from '@zambon-dev/ui/library';

/** A titled group of fields. Each field reads its control from the surrounding `formGroup`. */
@Component({
  selector: 'example-form-group-overview',
  imports: [FormGroupComponent, FormInputGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-2xl">
      <lib-form-group label="Customer">
        <lib-form-input-group controlName="name" label="Name" [validations]="{ required: 'Name is required' }">
        </lib-form-input-group>
        <lib-form-input-group
          controlName="email"
          label="Email"
          notes="Used for notifications"
          type="email"
          [validations]="{ email: 'Invalid email' }"
        >
        </lib-form-input-group>
      </lib-form-group>
    </form>
  `,
})
export class FormGroupOverviewExample {
  protected readonly form = new FormGroup({
    name: new FormControl<string>('Ada Lovelace', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl<string>('ada@example.com', { nonNullable: true, validators: [Validators.email] }),
  });
}
