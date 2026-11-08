import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormGroupComponent, FormInputGroupComponent, FormService } from '@zambon-dev/ui/library';

/** One labelled field bound to a control by name. */
@Component({
  selector: 'example-form-input-group-basic',
  imports: [FormGroupComponent, FormInputGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-md">
      <lib-form-group>
        <lib-form-input-group controlName="name" label="Name"></lib-form-input-group>
      </lib-form-group>
    </form>
  `,
})
export class FormInputGroupBasicExample {
  protected readonly form = new FormGroup({
    name: new FormControl<string>('Ada Lovelace'),
  });
}
