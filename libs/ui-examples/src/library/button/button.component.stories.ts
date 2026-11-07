import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '@zambon-dev/ui/library';
import { ButtonIconOnlyExample } from '../../examples/button/button-icon-only.example';
import { ButtonIntentsExample } from '../../examples/button/button-intents.example';
import { ButtonOverviewExample } from '../../examples/button/button-overview.example';
import { ButtonStatesExample } from '../../examples/button/button-states.example';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonIconOnlyExample, ButtonIntentsExample, ButtonOverviewExample, ButtonStatesExample],
    }),
  ],
  title: 'Buttons/Button',
};
export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-button-overview></example-button-overview>` }),
};

/** The four intents side by side. An intent says what the button is for; the theme picks the colour. */
export const Intents: Story = {
  render: () => ({ template: `<example-button-intents></example-button-intents>` }),
};

/**
 * Loading and success block activation, because the action is in flight or already done. Error does
 * not: it is the one outcome you retry from.
 */
export const States: Story = {
  render: () => ({ template: `<example-button-states></example-button-states>` }),
};

/** With no text the label collapses, so an icon-only button stays square and centred. */
export const IconOnly: Story = {
  render: () => ({ template: `<example-button-icon-only></example-button-icon-only>` }),
};
