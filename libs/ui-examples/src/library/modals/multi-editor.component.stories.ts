import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { MultiEditorComponent } from '@zambon-dev/ui/library';
import { MultiEditorBasicExample } from '../../examples/multi-editor/multi-editor-basic.example';
import { MultiEditorPricingExample } from '../../examples/multi-editor/multi-editor-pricing.example';

const meta: Meta<MultiEditorComponent> = {
  component: MultiEditorComponent,
  decorators: [moduleMetadata({ imports: [MultiEditorBasicExample, MultiEditorPricingExample] })],
  title: 'Library/Modals/Multi Editor',
};
export default meta;
type Story = StoryObj<MultiEditorComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-multi-editor-basic></example-multi-editor-basic>` }),
};

export const PricingEditor: Story = {
  render: () => ({ template: `<example-multi-editor-pricing></example-multi-editor-pricing>` }),
};
