import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ConfirmModalComponent } from '../../components/modals/confirm-modal/confirm-modal.component';
import { ErrorModalComponent } from '../../components/modals/error-modal/error-modal.component';

const meta: Meta<ConfirmModalComponent> = {
  component: ConfirmModalComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ConfirmModalComponent,
        ErrorModalComponent,
      ],
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
        <button type="button" class="btn blue-500" (click)="modal.toggleModal()">
          Open confirmation
        </button>

        <framework-confirm-modal
          #modal
          [message]="message"
          [messageIcon]="messageIcon"
          [messageIconColor]="messageIconColor"
          [showMessageIcon]="showMessageIcon"
          [size]="size"
          [title]="title">
          <div footer>
            <button type="button" class="btn blue-500" (click)="modal.closeModal()">
              Confirm
            </button>
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
        <button type="button" class="btn red-500" (click)="modal.showModal('The server rejected the requested operation.')">
          Open error
        </button>

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
