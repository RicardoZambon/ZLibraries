import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { RibbonComponent } from '@zambon-dev/ui/library';
import { RibbonContentSizedParentExample } from '../../examples/ribbon/ribbon-content-sized-parent.example';
import { RibbonOverviewExample } from '../../examples/ribbon/ribbon-overview.example';

const meta: Meta<RibbonComponent> = {
  component: RibbonComponent,
  decorators: [moduleMetadata({ imports: [RibbonContentSizedParentExample, RibbonOverviewExample] })],
  title: 'Library/Ribbon/Ribbon',
};
export default meta;
type Story = StoryObj<RibbonComponent>;

/**
 * The one layout `lib-ribbon` does not support, kept so a collapsed bar is one search away from its
 * cause. The example file explains why.
 */
export const CollapsesInAContentSizedParent: Story = {
  render: () => ({ template: `<example-ribbon-content-sized-parent></example-ribbon-content-sized-parent>` }),
};

export const Primary: Story = {
  render: () => ({ template: `<example-ribbon-overview></example-ribbon-overview>` }),
};
