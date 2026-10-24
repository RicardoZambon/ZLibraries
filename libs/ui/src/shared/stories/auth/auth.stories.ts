import { APP_CONFIG, AppConfig } from '@zambon-dev/ui/framework';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { LanguageSelectorComponent } from '../../auth/components/language-selector/language-selector.component';
import { LoginComponent } from '../../auth/components/login/login.component';

const meta: Meta<LoginComponent> = {
  component: LoginComponent,
  title: 'Shared/Auth',
};
export default meta;
type Story = StoryObj<LoginComponent>;

/** A stand-in mark, so the story shows the card as a branded application sees it. */
const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23004372'/%3E%3Cpath d='M18 22h28L22 42h24' stroke='white' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

/** The card with no branding configured: no logo, no company line. */
export const Login: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Login-Username'), 'storybook.user');
    await userEvent.type(canvas.getByPlaceholderText('Login-Password'), 'password');
    await userEvent.click(canvas.getByRole('button', { name: /Login-SignIn/i }));

    await expect(canvas.getByPlaceholderText('Login-Username')).toHaveValue('storybook.user');
  },
};

/** The same card once the application supplies a logo and a company name. */
export const LoginBranded: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: APP_CONFIG,
          useValue: new AppConfig('', { companyName: 'Zilia Technologies', loginLogoUrl: LOGO }),
        },
      ],
    }),
  ],
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
