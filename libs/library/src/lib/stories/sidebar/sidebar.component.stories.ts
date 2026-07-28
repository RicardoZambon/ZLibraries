import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Observable, of } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ISidebarProfile, SIDEBAR_CONFIGS, SidebarConfigs, SidebarMenu } from '../../models';
import { SidebarService } from '../../services';

class StorybookSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile {
    return {
      name: 'Ada Lovelace',
      title: 'System Administrator',
    };
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    if (parentMenu?.id === 2) {
      return of([
        new SidebarMenu({ id: 21, label: 'Customers', icon: 'fa-address-book', url: '/customers', parent: parentMenu }),
        new SidebarMenu({ id: 22, label: 'Suppliers', icon: 'fa-truck-field', url: '/suppliers', parent: parentMenu }),
      ]);
    }

    return of([
      new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard' }),
      new SidebarMenu({ id: 2, label: 'Catalogs', icon: 'fa-layer-group', childCount: 2 }),
      new SidebarMenu({ id: 3, label: 'Reports', icon: 'fa-file-lines', url: '/reports' }),
      new SidebarMenu({ id: 4, label: 'Settings', icon: 'fa-gear', url: '/settings' }),
    ]);
  }
}

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  decorators: [
    moduleMetadata({
      providers: [
        { provide: SidebarService, useClass: StorybookSidebarService },
        {
          provide: SIDEBAR_CONFIGS,
          useValue: new SidebarConfigs({
            errorText: 'Unable to load menu',
            loadingText: 'Loading menu',
          }),
        },
      ],
    }),
  ],
  title: 'Sidebar/Sidebar',
};
export default meta;
type Story = StoryObj<SidebarComponent>;

export const Primary: Story = {
  args: {
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[36rem] w-80 bg-slate-100">
        <lib-sidebar></lib-sidebar>
      </div>
    `,
  }),
};

