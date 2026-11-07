import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CatalogSelectComponent, FormGroupComponent, FormService } from '@zambon-dev/ui/library';

/**
 * A searchable pick list over a static list of entries. The field writes the chosen value to
 * `controlName` and its display text to `displayControlName`.
 */
@Component({
  selector: 'example-catalog-select-basic',
  imports: [CatalogSelectComponent, FormGroupComponent, ReactiveFormsModule],
  providers: [FormService],
  template: `
    <form [formGroup]="form" class="p-4 max-w-md">
      <lib-form-group>
        <lib-catalog-select
          controlName="catalogId"
          displayControlName="catalogName"
          label="Catalog"
          [entriesList]="entries"
        ></lib-catalog-select>
      </lib-form-group>
    </form>
  `,
})
export class CatalogSelectBasicExample {
  protected readonly form = new FormGroup({
    catalogId: new FormControl<number | null>(null),
    catalogName: new FormControl<string>(''),
  });

  protected readonly entries = [
    { value: 1, display: 'Alpha' },
    { value: 2, display: 'Beta' },
    { value: 3, display: 'Gamma' },
    { value: 4, display: 'Zeta' },
  ];
}
