import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../components/button/button.component';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  title: 'Buttons/Button',
};
export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    intent: 'primary',
    icon: 'fa-solid fa-floppy-disk',
  },
  render: (args) => ({
    props: args,
    template: `
      <lib-button [intent]="intent" [icon]="icon" [disabled]="disabled" [loading]="loading" [success]="success" [error]="error">
        Save
      </lib-button>
    `,
  }),
};

/** The four intents side by side. An intent says what the button is for; the theme picks the colour. */
export const Intents: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3 p-4">
        <lib-button intent="primary" icon="fa-solid fa-floppy-disk">Save</lib-button>
        <lib-button intent="secondary">Cancel</lib-button>
        <lib-button intent="danger" icon="fa-solid fa-trash">Delete</lib-button>
        <lib-button intent="ghost" icon="fa-solid fa-ellipsis" ariaLabel="More"></lib-button>
      </div>
    `,
  }),
};

/**
 * Loading and success block activation, because the action is in flight or already done. Error does
 * not: it is the one outcome you retry from.
 */
export const States: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3 p-4">
        <lib-button intent="primary" icon="fa-solid fa-floppy-disk">Idle</lib-button>
        <lib-button intent="primary" [loading]="true">Saving</lib-button>
        <lib-button intent="primary" [success]="true">Saved</lib-button>
        <lib-button intent="primary" [error]="true">Failed</lib-button>
        <lib-button intent="primary" [disabled]="true">Disabled</lib-button>
      </div>
    `,
  }),
};

/** With no text the label collapses, so an icon-only button stays square and centred. */
export const IconOnly: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-3 p-4">
        <lib-button intent="primary" icon="fa-solid fa-plus" ariaLabel="Add"></lib-button>
        <lib-button intent="secondary" icon="fa-solid fa-rotate" ariaLabel="Refresh"></lib-button>
        <lib-button intent="danger" icon="fa-solid fa-trash" ariaLabel="Delete"></lib-button>
        <lib-button intent="ghost" icon="fa-solid fa-gear" ariaLabel="Settings"></lib-button>
      </div>
    `,
  }),
};
