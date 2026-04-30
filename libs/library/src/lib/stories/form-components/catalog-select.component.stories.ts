import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CatalogSelectComponent } from '../../components/catalog-select/catalog-select.component';
import { FormGroupComponent } from '../../components/form-group/form-group.component';

const meta: Meta<CatalogSelectComponent> = {
  component: CatalogSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormGroupComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  title: 'Form Components/Catalog Select',
};
export default meta;
type Story = StoryObj<CatalogSelectComponent>;

export const Primary: Story = {
  args: {
    autofocus: false,
    controlName: 'catalogId',
    displayControlName: 'catalogName',
    displayProperty: 'display',
    entriesList: [
      { value: 1, display: 'Alpha' },
      { value: 2, display: 'Beta' },
      { value: 3, display: 'Gamma' },
      { value: 4, display: 'Zeta' },
    ],
    filters: {},
    label: 'Catalog',
    maxEntries: 100,
    minimumLengthSearch: 3,
    notes: '',
    readOnly: false,
    searchEndpoint: '',
    validations: {},
    valueProperty: 'value',
  },
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        catalogId: new FormControl<number | null>(null),
        catalogName: new FormControl<string>(''),
      }),
    },
    template: `
      <form [formGroup]="form" class="p-4 max-w-md">
        <lib-form-group>
          <lib-catalog-select
            [autofocus]="autofocus"
            [controlName]="controlName"
            [displayControlName]="displayControlName"
            [displayProperty]="displayProperty"
            [entriesList]="entriesList"
            [filters]="filters"
            [label]="label"
            [maxEntries]="maxEntries"
            [minimumLengthSearch]="minimumLengthSearch"
            [notes]="notes"
            [readOnly]="readOnly"
            [searchEndpoint]="searchEndpoint"
            [validations]="validations"
            [valueProperty]="valueProperty">
          </lib-catalog-select>
        </lib-form-group>
      </form>
    `,
  }),
};

export const EnumEntries: Story = {
  args: {
    ...Primary.args,
    controlName: 'type',
    displayControlName: 'typeName',
    entriesList: [
      { value: 'text', display: 'Text' },
      { value: 'date', display: 'Date' },
      { value: 'number', display: 'Number' },
      { value: 'checkbox', display: 'Checkbox' },
    ],
    label: 'Field type',
    validations: { required: 'Field type is required' },
    valueProperty: 'value',
  },
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        type: new FormControl<string | null>('date'),
        typeName: new FormControl<string>('Date'),
      }),
    },
    template: `
      <form [formGroup]="form" class="p-4 max-w-md">
        <lib-form-group label="Enum catalog">
          <lib-catalog-select
            [controlName]="controlName"
            [displayControlName]="displayControlName"
            [displayProperty]="displayProperty"
            [entriesList]="entriesList"
            [label]="label"
            [validations]="validations"
            [valueProperty]="valueProperty">
          </lib-catalog-select>
        </lib-form-group>
      </form>
    `,
  }),
};

export const RemoteSearchWithFilters: Story = {
  args: {
    ...Primary.args,
    autofocus: true,
    controlName: 'customerId',
    displayControlName: 'customerName',
    filters: { status: 'active', unitId: '42' },
    label: 'Customer',
    minimumLengthSearch: 2,
    searchEndpoint: '/api/catalog/customers',
    validations: { required: 'Customer is required' },
  },
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        customerId: new FormControl<number | null>(null),
        customerName: new FormControl<string>(''),
      }),
    },
    template: `
      <form [formGroup]="form" class="p-4 max-w-md">
        <lib-form-group label="Remote catalog">
          <lib-catalog-select
            [autofocus]="autofocus"
            [controlName]="controlName"
            [displayControlName]="displayControlName"
            [filters]="filters"
            [label]="label"
            [minimumLengthSearch]="minimumLengthSearch"
            [searchEndpoint]="searchEndpoint"
            [validations]="validations">
          </lib-catalog-select>
        </lib-form-group>
      </form>
    `,
  }),
};

