import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormGroupComponent, FormInputGroupComponent, FormService } from '@zambon-dev/ui/library';

/** The common field types. `type` picks the input; `format`, `step` and `rows` tune it. */
@Component({
  selector: 'example-form-input-group-types',
  imports: [FormGroupComponent, FormInputGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-3xl">
      <lib-form-group label="Common field types">
        <lib-form-input-group controlName="description" label="Description" [maxLength]="100"></lib-form-input-group>
        <lib-form-input-group
          controlName="startDate"
          label="Start date"
          type="date"
          format="yyyy-MM-dd"
        ></lib-form-input-group>
        <lib-form-input-group controlName="amount" label="Amount" type="number" [step]="0.01"></lib-form-input-group>
        <lib-form-input-group controlName="active" label="Active" type="checkbox"></lib-form-input-group>
        <lib-form-input-group controlName="notes" label="Notes" type="textarea" [rows]="3"></lib-form-input-group>
        <lib-form-input-group
          controlName="scheduledAt"
          label="Scheduled at"
          type="datetime-local"
        ></lib-form-input-group>
      </lib-form-group>
    </form>
  `,
})
export class FormInputGroupTypesExample {
  protected readonly form = new FormGroup({
    description: new FormControl<string>('Monthly membership fee'),
    startDate: new FormControl<string>('2026-04-30'),
    amount: new FormControl<number | null>(149.9),
    active: new FormControl<boolean>(true),
    notes: new FormControl<string>('Visible in reports and audit history.'),
    scheduledAt: new FormControl<string>('2026-04-30T09:30'),
  });
}
