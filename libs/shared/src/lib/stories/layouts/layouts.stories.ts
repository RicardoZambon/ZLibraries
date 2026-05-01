import { RouteReuseStrategy } from '@angular/router';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CustomReuseStrategy, TabService } from '@zambon-dev/framework';
import { ISidebarProfile, SidebarMenu, SidebarService } from '@zambon-dev/library';
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
