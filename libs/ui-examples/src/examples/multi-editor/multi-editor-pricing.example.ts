import { Component, Injectable } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  CatalogSelectComponent,
  DataGridDataset,
  FormInputGroupComponent,
  FormService,
  IBatchUpdate,
  IGridColumn,
  MultiEditorComponent,
  MultiEditorDataset,
} from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

interface ModifierRow {
  id: number;
  name: string;
  status: string;
}

@Injectable()
class ModifiersDataset extends DataGridDataset {
  public override columns: IGridColumn[] = [
    { field: 'id', headerName: 'ID', size: '5rem' },
    { field: 'name', headerName: 'Name', size: 'minmax(12rem, 1fr)' },
    { field: 'status', headerName: 'Status', size: '10rem' },
  ];

  public getData(): Observable<ModifierRow[]> {
    return of([
      { id: 1, name: 'Alpha record', status: 'Active' },
      { id: 2, name: 'Beta record', status: 'Pending' },
      { id: 3, name: 'Gamma record', status: 'Archived' },
    ]);
  }
}

@Injectable()
class ModifiersEditorDataset extends MultiEditorDataset {
  public newData(id: number): ModifierRow {
    return { id, name: 'New record', status: 'Draft' };
  }

  public saveData(batchUpdate: IBatchUpdate<ModifierRow, number>): Observable<IBatchUpdate<ModifierRow, number>> {
    return of(batchUpdate);
  }
}

/** A wider editor with a catalog, numbers with limits and dates: the fields a pricing table needs. */
@Component({
  selector: 'example-multi-editor-pricing',
  imports: [
    ButtonComponent,
    CatalogSelectComponent,
    FormInputGroupComponent,
    MultiEditorComponent,
    ReactiveFormsModule,
  ],
  providers: [
    FormService,
    { provide: DataGridDataset, useClass: ModifiersDataset },
    { provide: MultiEditorDataset, useClass: ModifiersEditorDataset },
  ],
  template: `
    <form [formGroup]="formGroup" class="p-4">
      <lib-button intent="primary" (click)="editor.toggleModal()">Open pricing editor</lib-button>

      <lib-multi-editor
        #editor
        title="Pricing modifiers"
        size="7xl"
        addButtonLabel="Add modifier"
        removeButtonLabel="Remove modifier"
        [formGroup]="formGroup"
      >
        <lib-form-input-group
          controlName="name"
          label="Name"
          [autofocus]="true"
          [validations]="{ required: 'Name is required' }"
        >
        </lib-form-input-group>
        <lib-catalog-select
          controlName="materialId"
          displayControlName="materialName"
          label="Material"
          [entriesList]="materials"
          [validations]="{ required: 'Material is required' }"
        >
        </lib-catalog-select>
        <lib-form-input-group
          controlName="order"
          label="Order"
          type="number"
          [step]="1"
          [validations]="{ min: 'Order must be greater than zero', required: 'Order is required' }"
        >
        </lib-form-input-group>
        <lib-form-input-group
          controlName="amount"
          label="Amount"
          type="number"
          [step]="0.01"
          [validations]="{ min: 'Amount must be positive', required: 'Amount is required' }"
        >
        </lib-form-input-group>
        <lib-form-input-group
          controlName="percent"
          label="Percent"
          type="number"
          [step]="1"
          [validations]="{ max: 'Percent cannot exceed 100', min: 'Percent must be positive' }"
        >
        </lib-form-input-group>
        <lib-form-input-group controlName="startDate" label="Start date" type="date" format="yyyy-MM-dd">
        </lib-form-input-group>
        <lib-form-input-group controlName="endDate" label="End date" type="date" format="yyyy-MM-dd">
        </lib-form-input-group>
      </lib-multi-editor>
    </form>
  `,
})
export class MultiEditorPricingExample {
  protected readonly formGroup = new FormGroup({
    id: new FormControl<number | null>(null),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    materialId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    materialName: new FormControl<string>(''),
    order: new FormControl<number | null>(1, { validators: [Validators.required, Validators.min(1)] }),
    amount: new FormControl<number | null>(0, { validators: [Validators.required, Validators.min(0)] }),
    percent: new FormControl<number | null>(10, { validators: [Validators.min(0), Validators.max(100)] }),
    startDate: new FormControl<string>('2026-04-30'),
    endDate: new FormControl<string>(''),
  });

  protected readonly materials = [
    { value: 1, display: 'Training manual' },
    { value: 2, display: 'Uniform' },
    { value: 3, display: 'Monthly package' },
  ];
}
