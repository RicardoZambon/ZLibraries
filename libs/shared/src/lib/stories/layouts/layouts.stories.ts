import { RouteReuseStrategy } from '@angular/router';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { APP_CONFIG, AppConfig, CustomReuseStrategy, TabService } from '@zambon-dev/framework';
import { ISidebarProfile, SidebarMenu, SidebarService } from '@zambon-dev/library';
import { AuthenticationService } from '@zambon-dev/shared';
import { Observable, of } from 'rxjs';
import { LoginComponent } from '../../auth/components/login/login.component';
import { LoginLayoutComponent } from '../../layouts/login-layout/login-layout.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

class StorybookSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile {
    return {
      name: 'Storybook User',
      title: 'Administrator',
    };
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    if (parentMenu?.id === 2) {
      return of([
        new SidebarMenu({ id: 21, label: 'Customers', icon: 'fa-address-book', url: '/customers', parent: parentMenu }),
        new SidebarMenu({ id: 22, label: 'Units', icon: 'fa-building', url: '/units', parent: parentMenu }),
      ]);
    }

    return of([
      new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard' }),
      new SidebarMenu({ id: 2, label: 'General', icon: 'fa-layer-group', childCount: 2 }),
      new SidebarMenu({ id: 3, label: 'Security', icon: 'fa-shield-halved', url: '/security' }),
    ]);
  }
}

const meta: Meta<MainLayoutComponent> = {
  component: MainLayoutComponent,
  decorators: [
    moduleMetadata({
      imports: [
        LoginComponent,
        LoginLayoutComponent,
      ],
      providers: [
        TabService,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        { provide: SidebarService, useClass: StorybookSidebarService },
      ],
    }),
  ],
  title: 'Shared/Layouts',
};
export default meta;
type Story = StoryObj<MainLayoutComponent>;

export const MainLayout: Story = {
  render: () => ({
    template: `
      <div class="h-[40rem] bg-slate-100">
        <shared-main-layout></shared-main-layout>
      </div>
    `,
  }),
};

// Renders the full layout and exposes Storybook Controls for the top-bar content
// (logo, app name, subtitle/company, environment, and the user). The AppConfig and
// AuthenticationService are rebuilt from the args on every render, so changing a control
// updates the brand, environment badge, and user profile live.
interface TopBarArgs {
  logoUrl: string;
  appName: string;
  companyName: string;
  environment: string;
  userName: string;
  userPosition: string;
  userPictureUrl: string;
}

export const TopBar: StoryObj<TopBarArgs> = {
  args: {
    logoUrl: '',
    appName: 'Engineering Change',
    companyName: 'Zilia Technologies',
    environment: 'QA',
    userName: 'Fernando Vasconcelos',
    userPosition: 'Gerente Sistemas TI II',
    userPictureUrl: '',
  },
  argTypes: {
    logoUrl: { control: 'text', name: 'Logo URL' },
    appName: { control: 'text', name: 'App name' },
    companyName: { control: 'text', name: 'App subtitle (company)' },
    environment: {
      control: 'select',
      options: ['DEV', 'QA', 'STG', 'PROD', ''],
      name: 'Environment (PROD/empty hides badge)',
    },
    userName: { control: 'text', name: 'User name' },
    userPosition: { control: 'text', name: 'User position' },
    userPictureUrl: { control: 'text', name: 'User picture URL' },
  },
  render: (args: TopBarArgs) => ({
    moduleMetadata: {
      providers: [
        {
          provide: APP_CONFIG,
          useValue: new AppConfig('', {
            appName: args.appName,
            companyName: args.companyName,
            environment: args.environment,
            logoUrl: args.logoUrl || undefined,
          }),
        },
        {
          provide: AuthenticationService,
          useValue: {
            getUserInfo: () => ({
              name: args.userName,
              costCenterName: 'TI',
              position: args.userPosition,
              pictureUrl: args.userPictureUrl || undefined,
            }),
            signOut: () => undefined,
          },
        },
      ],
    },
    template: `
      <div class="h-[40rem] bg-slate-100">
        <shared-main-layout></shared-main-layout>
      </div>
    `,
  }),
};

export const LoginLayout: StoryObj<LoginLayoutComponent> = {
  render: () => ({
    template: `
      <div class="h-[40rem]">
        <shared-login-layout>
          <shared-login></shared-login>
        </shared-login-layout>
      </div>
    `,
  }),
};
