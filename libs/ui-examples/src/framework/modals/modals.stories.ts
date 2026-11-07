import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ConfirmModalComponent, ErrorModalComponent } from '@zambon-dev/ui/framework';
import { ConfirmModalBasicExample } from '../../examples/framework-modals/confirm-modal-basic.example';
import { ErrorModalBasicExample } from '../../examples/framework-modals/error-modal-basic.example';

const meta: Meta<ConfirmModalComponent> = {
  component: ConfirmModalComponent,
  decorators: [moduleMetadata({ imports: [ConfirmModalBasicExample, ErrorModalBasicExample] })],
  title: 'Framework/Modals',
};
export default meta;
type Story = StoryObj<ConfirmModalComponent>;

export const ConfirmModal: Story = {
  render: () => ({ template: `<example-confirm-modal-basic></example-confirm-modal-basic>` }),
};

export const ErrorModal: StoryObj<ErrorModalComponent> = {
  render: () => ({ template: `<example-error-modal-basic></example-error-modal-basic>` }),
};
