import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '@zambon-dev/ui/framework';
import { FrameworkButtonsRibbonExample } from '../../examples/framework-buttons/framework-buttons-ribbon.example';
import { FrameworkButtonsStatesExample } from '../../examples/framework-buttons/framework-buttons-states.example';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  decorators: [moduleMetadata({ imports: [FrameworkButtonsRibbonExample, FrameworkButtonsStatesExample] })],
  title: 'Framework/Buttons',
};
export default meta;
type Story = StoryObj<ButtonComponent>;

export const RibbonActions: Story = {
  render: () => ({ template: `<example-framework-buttons-ribbon></example-framework-buttons-ribbon>` }),
};

export const LoadingAndDisabled: Story = {
  render: () => ({ template: `<example-framework-buttons-states></example-framework-buttons-states>` }),
};
