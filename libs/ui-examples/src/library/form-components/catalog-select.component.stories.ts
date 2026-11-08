import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CatalogSelectComponent } from '@zambon-dev/ui/library';
import { CatalogSelectBasicExample } from '../../examples/catalog-select/catalog-select-basic.example';
import { CatalogSelectEnumExample } from '../../examples/catalog-select/catalog-select-enum.example';
import { CatalogSelectRemoteExample } from '../../examples/catalog-select/catalog-select-remote.example';
import { CatalogSelectShortListExample } from '../../examples/catalog-select/catalog-select-short-list.example';

const meta: Meta<CatalogSelectComponent> = {
  component: CatalogSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CatalogSelectBasicExample,
        CatalogSelectEnumExample,
        CatalogSelectRemoteExample,
        CatalogSelectShortListExample,
      ],
    }),
  ],
  title: 'Library/Form Components/Catalog Select',
};
export default meta;
type Story = StoryObj<CatalogSelectComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-catalog-select-basic></example-catalog-select-basic>` }),
};

export const EnumEntries: Story = {
  render: () => ({ template: `<example-catalog-select-enum></example-catalog-select-enum>` }),
};

export const RemoteSearchWithFilters: Story = {
  render: () => ({ template: `<example-catalog-select-remote></example-catalog-select-remote>` }),
};

/**
 * A catalog of a couple of entries is a picker, not a search. With `searchable` off the input takes
 * no typing, while the dropdown still opens on click and the value can still be cleared.
 */
export const ShortListWithoutSearch: Story = {
  render: () => ({ template: `<example-catalog-select-short-list></example-catalog-select-short-list>` }),
};
