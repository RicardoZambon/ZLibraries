import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormInputComponent, FormService } from '@zambon-dev/ui/library';

/**
 * The bare input inside `lib-form-input-group`, for a layout of your own. It has no label, so wrap
 * it in one.
 */
@Component({
  selector: 'example-form-input-basic',
  imports: [FormInputComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="grid max-w-md gap-3 p-4">
      <label class="grid gap-1">
        Name
        <lib-form-input controlName="name" [maxLength]="60"></lib-form-input>
      </label>
      <label class="grid gap-1">
        Quantity
        <lib-form-input controlName="quantity" type="number" [step]="1"></lib-form-input>
      </label>
      <label class="grid gap-1">
        Due date
        <lib-form-input controlName="dueDate" type="date"></lib-form-input>
      </label>
      <label class="grid gap-1">
        Notes
        <lib-form-input controlName="notes" type="textarea" [rows]="3"></lib-form-input>
      </label>
    </form>
  `,
})
export class FormInputBasicExample {
  protected readonly form = new FormGroup({
    name: new FormControl<string>('Training manual'),
    quantity: new FormControl<number | null>(12),
    dueDate: new FormControl<string>('2026-04-30'),
    notes: new FormControl<string>('Deliver to the front desk.'),
  });
}
