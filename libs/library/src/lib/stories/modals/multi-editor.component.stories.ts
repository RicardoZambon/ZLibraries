import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Observable, of } from 'rxjs';
import { CatalogSelectComponent } from '../../components/catalog-select/catalog-select.component';
import { FormInputGroupComponent } from '../../components/form-input-group/form-input-group.component';
import { MultiEditorComponent } from '../../components/multi-editor/multi-editor.component';
import { IBatchUpdate } from '../../models/batch-update';
import { DataGridDataset, MultiEditorDataset } from '../../services';

class StorybookMultiEditorGridDataset extends DataGridDataset {
  public override columns = [
    { field: 'id', headerName: 'ID', size: '5rem' },
    { field: 'name', headerName: 'Name', size: 'minmax(12rem, 1fr)' },
    { field: 'status', headerName: 'Status', size: '10rem' },
  ];

  public getData(): Observable<any[]> {
    return of([
      { id: 1, name: 'Alpha record', status: 'Active' },
      { id: 2, name: 'Beta record', status: 'Pending' },
      { id: 3, name: 'Gamma record', status: 'Archived' },
    ]);
  }
}

class StorybookMultiEditorDataset extends MultiEditorDataset {
  public newData(id: any): any {
    return {
      id,
      name: 'New record',
      status: 'Draft',
    };
  }

  public saveData(batchUpdate: IBatchUpdate<any, any>): Observable<any> {
    return of(batchUpdate);
  }
}

const meta: Meta<MultiEditorComponent> = {
  component: MultiEditorComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CatalogSelectComponent,
        FormInputGroupComponent,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: DataGridDataset, useClass: StorybookMultiEditorGridDataset },
        { provide: MultiEditorDataset, useClass: StorybookMultiEditorDataset },
      ],
    }),
  ],
  title: 'Modals/Multi Editor',
};
export default meta;
type Story = StoryObj<MultiEditorComponent>;

export const Primary: Story = {
  args: {
    addButtonLabel: 'Add row',
    removeButtonLabel: 'Remove row',
    showAddButton: true,
    showDeleteButton: true,
  },
  render: (args) => ({
    props: {
      ...args,
      formGroup: new FormGroup({
        id: new FormControl<number | null>(null),
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        status: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      }),
    },
    template: `
      <form [formGroup]="formGroup" class="p-4">
        <button type="button" class="btn blue-500" (click)="editor.toggleModal()">
          Open editor
        </button>

        <lib-multi-editor
          #editor
          title="Edit records"
          size="5xl"
          [addButtonLabel]="addButtonLabel"
          [formGroup]="formGroup"
          [removeButtonLabel]="removeButtonLabel"
          [showAddButton]="showAddButton"
          [showDeleteButton]="showDeleteButton">
          <lib-form-input-group
            controlName="name"
            label="Name"
            [validations]="{ required: 'Name is required' }">
          </lib-form-input-group>

          <lib-form-input-group
            controlName="status"
            label="Status"
            [validations]="{ required: 'Status is required' }">
          </lib-form-input-group>
        </lib-multi-editor>
      </form>
    `,
  }),
};

export const PricingEditor: Story = {
  args: {
    addButtonLabel: 'Add modifier',
    removeButtonLabel: 'Remove modifier',
    showAddButton: true,
    showDeleteButton: true,
  },
  render: (args) => ({
    props: {
      ...args,
      formGroup: new FormGroup({
        id: new FormControl<number | null>(null),
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        materialId: new FormControl<number | null>(null, { validators: [Validators.required] }),
        materialName: new FormControl<string>(''),
        order: new FormControl<number | null>(1, { validators: [Validators.required, Validators.min(1)] }),
        amount: new FormControl<number | null>(0, { validators: [Validators.required, Validators.min(0)] }),
        percent: new FormControl<number | null>(10, { validators: [Validators.min(0), Validators.max(100)] }),
        startDate: new FormControl<string>('2026-04-30'),
        endDate: new FormControl<string>(''),
      }),
      materials: [
        { value: 1, display: 'Training manual' },
        { value: 2, display: 'Uniform' },
        { value: 3, display: 'Monthly package' },
      ],
    },
    template: `
      <form [formGroup]="formGroup" class="p-4">
        <button type="button" class="btn blue-500" (click)="editor.toggleModal()">
          Open pricing editor
        </button>

        <lib-multi-editor
          #editor
          title="Pricing modifiers"
          size="7xl"
          [addButtonLabel]="addButtonLabel"
          [formGroup]="formGroup"
          [removeButtonLabel]="removeButtonLabel"
          [showAddButton]="showAddButton"
          [showDeleteButton]="showDeleteButton">
          <lib-form-input-group
            controlName="name"
            label="Name"
            [autofocus]="true"
            [validations]="{ required: 'Name is required' }">
          </lib-form-input-group>
          <lib-catalog-select
            controlName="materialId"
            displayControlName="materialName"
            label="Material"
            [entriesList]="materials"
            [validations]="{ required: 'Material is required' }">
          </lib-catalog-select>
          <lib-form-input-group
            controlName="order"
            label="Order"
            type="number"
            [step]="1"
            [validations]="{ min: 'Order must be greater than zero', required: 'Order is required' }">
          </lib-form-input-group>
          <lib-form-input-group
            controlName="amount"
            label="Amount"
            type="number"
            [step]="0.01"
            [validations]="{ min: 'Amount must be positive', required: 'Amount is required' }">
          </lib-form-input-group>
          <lib-form-input-group
            controlName="percent"
            label="Percent"
            type="number"
            [step]="1"
            [validations]="{ max: 'Percent cannot exceed 100', min: 'Percent must be positive' }">
          </lib-form-input-group>
          <lib-form-input-group controlName="startDate" label="Start date" type="date" format="yyyy-MM-dd"></lib-form-input-group>
          <lib-form-input-group controlName="endDate" label="End date" type="date" format="yyyy-MM-dd"></lib-form-input-group>
        </lib-multi-editor>
      </form>
    `,
  }),
};

