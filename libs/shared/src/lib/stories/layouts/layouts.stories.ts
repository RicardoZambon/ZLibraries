import { RouteReuseStrategy } from '@angular/router';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { APP_CONFIG, AppConfig, CustomReuseStrategy, TabService } from '@zambon-dev/framework';
import { ISidebarProfile, SidebarMenu, SidebarService } from '@zambon-dev/library';
import { AuthenticationService, INotification, NotificationsService } from '@zambon-dev/shared';
import { Observable, of } from 'rxjs';
import { LoginComponent } from '../../auth/components/login/login.component';
import { LoginLayoutComponent } from '../../layouts/login-layout/login-layout.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

const NOTIFICATION_ICONS = ['fa-solid fa-circle-info', 'fa-solid fa-triangle-exclamation', 'fa-solid fa-envelope'];

// Story-only: constrain the layout to its container (the app uses full-viewport sizing, which
// forces a scrollbar inside the Storybook canvas).
const FIT_TO_CONTAINER = `
  <style>
    /* ::ng-deep pierces the story component's style encapsulation so these reach into
       shared-main-layout's own view; !important wins over the component's max-h-screen. */
    ::ng-deep shared-main-layout { display: block; height: 100%; max-height: 100%; }
    ::ng-deep shared-main-layout .main-container { max-height: 100% !important; }
  </style>
`;

function buildMockNotifications(count: number): INotification[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => ({
    title: `Notification ${i + 1}`,
    description: 'This is a sample notification message.',
    icon: NOTIFICATION_ICONS[i % NOTIFICATION_ICONS.length],
    callToActionUrl: i % 2 === 0 ? `/records/${i + 1}` : undefined,
    isRead: false,
  }));
}

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
      ${FIT_TO_CONTAINER}
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
  version: string;
  notificationsEnabled: boolean;
  notificationCount: number;
  userName: string;
  userPosition: string;
  userPictureUrl: string;
}

export const TopBar: StoryObj<TopBarArgs> = {
  args: {
    logoUrl: '',
    appName: 'Application name',
    companyName: 'Company name',
    environment: 'QA',
    version: '1.4.0',
    notificationsEnabled: true,
    notificationCount: 0,
    userName: 'John Doe',
    userPosition: 'Software Engineer',
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
    version: { control: 'text', name: 'App version (sidebar footer)' },
    notificationsEnabled: {
      control: 'boolean',
      name: 'Notifications enabled (off hides the bell)',
    },
    notificationCount: {
      control: { type: 'number', min: 0 },
      name: 'Notification unread count (0 hides the number)',
    },
    userName: { control: 'text', name: 'User name' },
    userPosition: { control: 'text', name: 'User subtitle (position)' },
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
            version: args.version,
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
        {
          provide: NotificationsService,
          useValue: {
            isEnabled: args.notificationsEnabled,
            start: () => undefined,
            stop: () => Promise.resolve(),
            getNotifications: () => of(buildMockNotifications(args.notificationCount)),
            getUnreadCount: () => of(Math.max(0, args.notificationCount)),
            markAsRead: () => undefined,
            markAllAsRead: () => undefined,
          },
        },
      ],
    },
    template: `
      ${FIT_TO_CONTAINER}
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
