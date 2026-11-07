import { Component, Injectable } from '@angular/core';
import {
  ISidebarProfile,
  SIDEBAR_CONFIGS,
  SidebarComponent,
  SidebarConfigs,
  SidebarMenu,
  SidebarService,
} from '@zambon-dev/ui/library';
import { Observable, of } from 'rxjs';

/**
 * The sidebar asks this service for menus, one level at a time, and for the signed-in user. A real
 * one loads the menus from your API.
 */
@Injectable()
class MenuService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile {
    return { name: 'Ada Lovelace', title: 'System Administrator' };
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    if (parentMenu?.id === 2) {
      return of([
        new SidebarMenu({ id: 21, label: 'Customers', icon: 'fa-address-book', url: '/customers', parent: parentMenu }),
        new SidebarMenu({ id: 22, label: 'Suppliers', icon: 'fa-truck-field', url: '/suppliers', parent: parentMenu }),
      ]);
    }

    return of([
      new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard', region: 'MAIN' }),
      new SidebarMenu({ id: 2, label: 'Catalogs', icon: 'fa-layer-group', childCount: 2, region: 'MAIN' }),
      new SidebarMenu({ id: 3, label: 'Reports', icon: 'fa-file-lines', url: '/reports', region: 'DATA' }),
      new SidebarMenu({ id: 4, label: 'Settings', icon: 'fa-gear', url: '/settings', region: 'DATA' }),
    ]);
  }
}

/** A small menu in two regions, with one item that opens a submenu. */
@Component({
  selector: 'example-sidebar-overview',
  imports: [SidebarComponent],
  providers: [
    { provide: SidebarService, useClass: MenuService },
    {
      provide: SIDEBAR_CONFIGS,
      useValue: new SidebarConfigs({ errorText: 'Unable to load menu', loadingText: 'Loading menu' }),
    },
  ],
  template: `
    <div style="height: 40rem; padding: 1.5rem; display: flex; background: var(--app-backdrop);">
      <lib-sidebar></lib-sidebar>
    </div>
  `,
})
export class SidebarOverviewExample {}
