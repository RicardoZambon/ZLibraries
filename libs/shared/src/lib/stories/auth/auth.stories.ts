import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { LanguageSelectorComponent } from '../../auth/components/language-selector/language-selector.component';
import { LoginComponent } from '../../auth/components/login/login.component';

const meta: Meta<LoginComponent> = {
  component: LoginComponent,
  title: 'Shared/Auth',
};
export default meta;
type Story = StoryObj<LoginComponent>;

export const Login: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Login-Username'), 'storybook.user');
    await userEvent.type(canvas.getByPlaceholderText('Login-Password'), 'password');
    await userEvent.click(canvas.getByRole('button', { name: /Login-SignIn/i }));

    await expect(canvas.getByPlaceholderText('Login-Username')).toHaveValue('storybook.user');
  },
};

export const LanguageSelector: StoryObj<LanguageSelectorComponent> = {
  render: () => ({
    template: `
      <div class="p-4 flex justify-end">
        <shared-language-selector title="Language"></shared-language-selector>
      </div>
    `,
  }),
};
