import { ButtonComponent } from '@zambon-dev/library';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ConfirmModalComponent } from '../../components/modals/confirm-modal/confirm-modal.component';
import { ErrorModalComponent } from '../../components/modals/error-modal/error-modal.component';

const meta: Meta<ConfirmModalComponent> = {
  component: ConfirmModalComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, ConfirmModalComponent, ErrorModalComponent],
    }),
  ],
  title: 'Framework/Modals',
};
export default meta;
type Story = StoryObj<ConfirmModalComponent>;

export const ConfirmModal: Story = {
  args: {
    message: 'This action will update the selected record.',
    messageIcon: 'fa-solid fa-circle-question',
    messageIconColor: 'text-cyan-500',
    showMessageIcon: true,
    size: 'xl',
    title: 'Confirm action',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4">
        <lib-button intent="primary" (click)="modal.toggleModal()">
          Open confirmation
        </lib-button>

        <framework-confirm-modal
          #modal
          [message]="message"
          [messageIcon]="messageIcon"
          [messageIconColor]="messageIconColor"
          [showMessageIcon]="showMessageIcon"
          [size]="size"
          [title]="title">
          <div footer>
            <lib-button intent="primary" (click)="modal.closeModal()">
              Confirm
            </lib-button>
          </div>
        </framework-confirm-modal>
      </div>
    `,
  }),
};

export const ErrorModal: StoryObj<ErrorModalComponent> = {
  render: () => ({
    template: `
      <div class="p-4">
        <lib-button intent="danger" (click)="modal.showModal('The server rejected the requested operation.')">
          Open error
        </lib-button>

        <framework-error-modal
          #modal
          size="xl"
          title="Action failed"
          subtitle="Please review the record and try again.">
        </framework-error-modal>
      </div>
    `,
  }),
};
