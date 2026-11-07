import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { DataGridComponent } from '@zambon-dev/ui/library';
import { DataGridBasicExample } from '../../examples/data-grid/data-grid-basic.example';
import { DataGridChildListExample } from '../../examples/data-grid/data-grid-child-list.example';
import { DataGridMultiSelectExample } from '../../examples/data-grid/data-grid-multi-select.example';
import { DataGridToolbarExample } from '../../examples/data-grid/data-grid-toolbar.example';

const meta: Meta<DataGridComponent> = {
  component: DataGridComponent,
  decorators: [
    moduleMetadata({
      imports: [DataGridBasicExample, DataGridChildListExample, DataGridMultiSelectExample, DataGridToolbarExample],
    }),
  ],
  title: 'Library/Data Grid/Data Grid',
};
export default meta;
type Story = StoryObj<DataGridComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-data-grid-basic></example-data-grid-basic>` }),
};

export const WithButtons: Story = {
  render: () => ({ template: `<example-data-grid-toolbar></example-data-grid-toolbar>` }),
};

export const ChildListWithButtons: Story = {
  render: () => ({ template: `<example-data-grid-child-list></example-data-grid-child-list>` }),
};

/**
 * Multi-select over rows taller than the 41.6px default. Anything misaligned in the selection
 * column stands out at this height, so this is the story to check the checkbox centring.
 */
export const MultiSelectTallRows: Story = {
  render: () => ({ template: `<example-data-grid-multi-select></example-data-grid-multi-select>` }),
};

export const Disabled: Story = {
  render: () => ({ template: `<example-data-grid-basic [disabled]="true"></example-data-grid-basic>` }),
};
