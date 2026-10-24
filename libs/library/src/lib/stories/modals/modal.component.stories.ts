import { ButtonComponent } from '../../components/button/button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ModalComponent } from '../../components/modal/modal.component';

const meta: Meta<ModalComponent> = {
  component: ModalComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  title: 'Modals/Simple Modal',
};
export default meta;
type Story = StoryObj<ModalComponent>;

export const Primary: Story = {
  args: {
    closeButtonText: 'Close',
    dialog: true,
    modalProcessing: false,
    position: 'center',
    size: 'md',
    title: 'Simple modal',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4">
        <lib-button intent="primary" (click)="modal.toggleModal()">
          Open modal
        </lib-button>

        <lib-modal
          #modal
          [closeButtonText]="closeButtonText"
          [dialog]="dialog"
          [modalProcessing]="modalProcessing"
          [position]="position"
          [size]="size"
          [title]="title">
          <div body class="grid gap-3 text-sm text-slate-700">
            <p>This is a simple modal body rendered through the projected body slot.</p>
            <p>Use this story to validate modal sizing, positioning, close behavior, and footer actions.</p>
          </div>

          <div footer>
            <lib-button intent="primary" (click)="modal.toggleModal()">
              Confirm
            </lib-button>
          </div>
        </lib-modal>
      </div>
    `,
  }),
};

export const TopConfirmation: Story = {
  args: {
    closeButtonText: 'Cancel',
    dialog: true,
    modalProcessing: false,
    position: 'top',
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

        <lib-modal
          #modal
          [closeButtonText]="closeButtonText"
          [dialog]="dialog"
          [modalProcessing]="modalProcessing"
          [position]="position"
          [size]="size"
          [title]="title">
          <div body class="grid gap-3 text-sm text-slate-700">
            <p>This mirrors the top-position confirmation modals used for activate, pause, reprocess, and similar actions.</p>
            <p>The action cannot be undone after confirmation.</p>
          </div>

          <div footer>
            <lib-button intent="danger" (click)="modal.toggleModal()">
              Confirm
            </lib-button>
          </div>
        </lib-modal>
      </div>
    `,
  }),
};

export const ErrorDialog: Story = {
  args: {
    closeButtonText: 'Close',
    dialog: true,
    modalProcessing: false,
    position: 'top',
    size: 'xl',
    title: 'Action failed',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-4">
        <lib-button intent="danger" (click)="modal.toggleModal()">
          Open error
        </lib-button>

        <lib-modal
          #modal
          [closeButtonText]="closeButtonText"
          [dialog]="dialog"
          [modalProcessing]="modalProcessing"
          [position]="position"
          [size]="size"
          [title]="title">
          <div body class="flex items-start gap-3 text-sm text-slate-700">
            <i class="fa-solid fa-triangle-exclamation mt-1 text-yellow-600"></i>
            <p>The operation failed because the selected record is no longer in a valid state.</p>
          </div>
        </lib-modal>
      </div>
    `,
  }),
};
