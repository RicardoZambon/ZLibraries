import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CatalogSelectComponent, FormGroupComponent, FormService } from '@zambon-dev/ui/library';

/**
 * Entries come from an API endpoint once the user has typed enough characters. `filters` are sent
 * with every search.
 */
@Component({
  selector: 'example-catalog-select-remote',
  imports: [CatalogSelectComponent, FormGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-md">
      <lib-form-group label="Remote catalog">
        <lib-catalog-select
          controlName="customerId"
          displayControlName="customerName"
          label="Customer"
          searchEndpoint="/api/catalog/customers"
          [autofocus]="true"
          [filters]="filters"
          [minimumLengthSearch]="2"
          [validations]="{ required: 'Customer is required' }"
        ></lib-catalog-select>
      </lib-form-group>
    </form>
  `,
})
export class CatalogSelectRemoteExample {
  protected readonly form = new FormGroup({
    customerId: new FormControl<number | null>(null),
    customerName: new FormControl<string>(''),
  });

  protected readonly filters = { status: 'active', unitId: '42' };
}
