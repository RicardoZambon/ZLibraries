import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CatalogSelectComponent, FormGroupComponent, FormService } from '@zambon-dev/ui/library';

/**
 * A catalog of a couple of entries is a picker, not a search. With `searchable` off the input takes
 * no typing, while the dropdown still opens on click and the value can still be cleared.
 */
@Component({
  selector: 'example-catalog-select-short-list',
  imports: [CatalogSelectComponent, FormGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-md">
      <lib-form-group label="Short catalog">
        <lib-catalog-select
          controlName="positionId"
          displayControlName="positionName"
          label="New position"
          [entriesList]="positions"
          [searchable]="false"
          [validations]="{ required: 'New position is required' }"
        ></lib-catalog-select>
      </lib-form-group>
    </form>
  `,
})
export class CatalogSelectShortListExample {
  protected readonly form = new FormGroup({
    positionId: new FormControl<number | null>(null),
    positionName: new FormControl<string>(''),
  });

  protected readonly positions = [
    { value: 1, display: 'Employee' },
    { value: 2, display: 'Manager' },
  ];
}
