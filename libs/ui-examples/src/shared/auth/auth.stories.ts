import { APP_CONFIG, AppConfig } from '@zambon-dev/ui/framework';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent } from 'storybook/test';
import { LoginComponent } from '../../auth/components/login/login.component';
import { LoginLayoutComponent } from '../../layouts/login-layout/login-layout.component';

const meta: Meta<LoginComponent> = {
  component: LoginComponent,
  decorators: [moduleMetadata({ imports: [LoginComponent, LoginLayoutComponent] })],
  title: 'Shared/Auth',
};
export default meta;
type Story = StoryObj<LoginComponent>;

/** A stand-in mark, so the story shows the card as a branded application sees it. */
const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23004372'/%3E%3Cpath d='M18 22h28L22 42h24' stroke='white' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

/*
 * The card goes inside the layout that hosts it in the application, because that is what centres
 * it and paints the backdrop behind it. On its own the component renders in the top-left corner of
 * the canvas -- a property of the story, not of the sign-in page.
 */
const IN_LAYOUT = `
  <div class="h-[40rem]">
    <shared-login-layout>
      <shared-login></shared-login>
    </shared-login-layout>
  </div>
`;

/** The card with no branding configured: no logo, no company line. */
export const Login: Story = {
  render: () => ({ template: IN_LAYOUT }),
  play: async ({ canvasElement }) => {
    /*
     * Found by id rather than by placeholder. This used to type into the field whose placeholder
     * was the literal 'Login-Username', which only worked while the stories showed raw i18n keys;
     * they load the real translation files now, and an id survives either way.
     */
    const field = <T extends HTMLElement>(selector: string): T => {
      const element = canvasElement.querySelector<T>(selector);
      if (!element) throw new Error(`The sign-in card has no ${selector}`);
      return element;
    };

    const username = field<HTMLInputElement>('#username');

    await userEvent.type(username, 'storybook.user');
    await userEvent.type(field<HTMLInputElement>('#password'), 'password');
    await userEvent.click(field<HTMLButtonElement>('button[type="submit"]'));

    await expect(username).toHaveValue('storybook.user');
  },
};

/** The same card once the application supplies a logo and a company name. */
export const LoginBranded: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: APP_CONFIG,
          useValue: new AppConfig('', { companyName: 'Zambon LTDA', loginLogoUrl: LOGO }),
        },
      ],
    }),
  ],
  render: () => ({ template: IN_LAYOUT }),
};
