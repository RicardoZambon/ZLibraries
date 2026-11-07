import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CatalogSelectComponent, FormGroupComponent, FormService } from '@zambon-dev/ui/library';

/** Entries can carry string values, such as the members of an enum, and start with one chosen. */
@Component({
  selector: 'example-catalog-select-enum',
  imports: [CatalogSelectComponent, FormGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-md">
      <lib-form-group label="Enum catalog">
        <lib-catalog-select
          controlName="type"
          displayControlName="typeName"
          label="Field type"
          [entriesList]="fieldTypes"
          [validations]="{ required: 'Field type is required' }"
        ></lib-catalog-select>
      </lib-form-group>
    </form>
  `,
})
export class CatalogSelectEnumExample {
  protected readonly form = new FormGroup({
    type: new FormControl<string | null>('date'),
    typeName: new FormControl<string>('Date'),
  });

  protected readonly fieldTypes = [
    { value: 'text', display: 'Text' },
    { value: 'date', display: 'Date' },
    { value: 'number', display: 'Number' },
    { value: 'checkbox', display: 'Checkbox' },
  ];
}
