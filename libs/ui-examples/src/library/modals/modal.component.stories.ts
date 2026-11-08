import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ModalComponent } from '@zambon-dev/ui/library';
import { ModalBasicExample } from '../../examples/modal/modal-basic.example';
import { ModalErrorExample } from '../../examples/modal/modal-error.example';
import { ModalTopConfirmationExample } from '../../examples/modal/modal-top-confirmation.example';

const meta: Meta<ModalComponent> = {
  component: ModalComponent,
  decorators: [moduleMetadata({ imports: [ModalBasicExample, ModalErrorExample, ModalTopConfirmationExample] })],
  title: 'Library/Modals/Simple Modal',
};
export default meta;
type Story = StoryObj<ModalComponent>;

export const Primary: Story = {
  render: () => ({ template: `<example-modal-basic></example-modal-basic>` }),
};

export const TopConfirmation: Story = {
  render: () => ({ template: `<example-modal-top-confirmation></example-modal-top-confirmation>` }),
};

export const ErrorDialog: Story = {
  render: () => ({ template: `<example-modal-error></example-modal-error>` }),
};
