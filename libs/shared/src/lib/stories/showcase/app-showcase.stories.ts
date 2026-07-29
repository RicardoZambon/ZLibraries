import { Component } from '@angular/core';
import { ROUTES, RouteReuseStrategy, Routes } from '@angular/router';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import {
  CustomReuseStrategy,
  DefaultTabViewComponent,
  FRAMEWORK_VIEW_TYPE,
  FrameworkViewType,
  TabService,
} from '@zambon-dev/framework';
import { ISidebarProfile, SidebarMenu, SidebarService } from '@zambon-dev/library';
import { Observable, of } from 'rxjs';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

// ---------------------------------------------------------------------------
// Mock backend — in-memory seed data
// ---------------------------------------------------------------------------

interface IUsersList {
  email: string;
  id: number;
  isActive: boolean;
  name: string;
  username: string;
}

const USERS: IUsersList[] = [
  { id: 1, name: 'Ada Lovelace', username: 'ada.lovelace', email: 'ada@example.com', isActive: true },
  { id: 2, name: 'Alan Turing', username: 'alan.turing', email: 'alan@example.com', isActive: true },
  { id: 3, name: 'Grace Hopper', username: 'grace.hopper', email: 'grace@example.com', isActive: true },
  { id: 4, name: 'Edsger Dijkstra', username: 'edsger.dijkstra', email: 'edsger@example.com', isActive: false },
  { id: 5, name: 'Barbara Liskov', username: 'barbara.liskov', email: 'barbara@example.com', isActive: true },
];

interface ICustomersList {
  city: string;
  email: string;
  id: number;
  isActive: boolean;
  name: string;
}

const CUSTOMERS: ICustomersList[] = [
  { id: 1, name: 'Acme Industries', city: 'Toronto', email: 'contact@acme.com', isActive: true },
  { id: 2, name: 'Globex Corporation', city: 'Montreal', email: 'hello@globex.com', isActive: true },
  { id: 3, name: 'Initech Systems', city: 'Vancouver', email: 'info@initech.com', isActive: false },
  { id: 4, name: 'Umbrella Health', city: 'Calgary', email: 'care@umbrella.com', isActive: true },
  { id: 5, name: 'Stark Manufacturing', city: 'Ottawa', email: 'sales@stark.com', isActive: true },
];

interface IUnitsList {
  code: string;
  description: string;
  id: number;
  name: string;
}

const UNITS: IUnitsList[] = [
  { id: 1, code: 'HQ-01', name: 'Head Office', description: 'Main administrative building' },
  { id: 2, code: 'WH-02', name: 'West Warehouse', description: 'Storage and logistics' },
  { id: 3, code: 'PL-03', name: 'Assembly Plant', description: 'Primary production line' },
  { id: 4, code: 'LB-04', name: 'Research Lab', description: 'Product development' },
  { id: 5, code: 'BR-05', name: 'Downtown Branch', description: 'Client-facing office' },
];

// ---------------------------------------------------------------------------
// Sidebar — the navigable menu tree. Menu `url`s must match the route paths.
// ---------------------------------------------------------------------------

const MENU_DASHBOARD = 1;
const MENU_GENERAL = 2;
const MENU_SECURITY = 3;

class ShowcaseSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ id: MENU_DASHBOARD, label: 'Dashboard', icon: 'fa-chart-line', url }));
  }

  public getUserProfile(): ISidebarProfile {
    return {
      name: 'Ada Lovelace',
      title: 'System Administrator',
    };
  }

  protected loadMenus(parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    if (parentMenu?.id === MENU_GENERAL) {
      return of([
        new SidebarMenu({ id: 21, label: 'Customers', icon: 'fa-address-book', url: '/general/customers', parent: parentMenu }),
        new SidebarMenu({ id: 22, label: 'Units', icon: 'fa-building', url: '/general/units', parent: parentMenu }),
      ]);
    }

    if (parentMenu?.id === MENU_SECURITY) {
      return of([
        new SidebarMenu({ id: 31, label: 'Users', icon: 'fa-user', url: '/security/users', parent: parentMenu }),
      ]);
    }

    return of([
      new SidebarMenu({ id: MENU_DASHBOARD, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard', region: 'MAIN' }),
      new SidebarMenu({ id: MENU_GENERAL, label: 'General', icon: 'fa-layer-group', childCount: 2, region: 'MAIN' }),
      new SidebarMenu({ id: MENU_SECURITY, label: 'Security', icon: 'fa-shield-halved', childCount: 1, region: 'ADMINISTRATION' }),
    ]);
  }
}

// ---------------------------------------------------------------------------
// Dashboard screen — a plain component (no grid, no form)
// ---------------------------------------------------------------------------

interface IDashboardCard {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'showcase-dashboard',
  imports: [],
  template: `
    <div class="p-6 flex flex-col gap-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        @for (card of cards; track card.label) {
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <i class="fa-solid {{ card.icon }} text-xl text-slate-400"></i>
              <div>
                <div class="text-2xl font-semibold text-slate-800">{{ card.value }}</div>
                <div class="text-xs uppercase tracking-wide text-slate-500">{{ card.label }}</div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          Recent activity
        </div>
        <ul class="divide-y divide-slate-100">
          @for (entry of activity; track entry) {
            <li class="px-4 py-2 text-sm text-slate-600">{{ entry }}</li>
          }
        </ul>
      </div>
    </div>
  `,
})
class DashboardComponent {
  protected activity: string[] = [
    'Ada Lovelace updated customer Acme Industries',
    'Alan Turing created unit BR-05 Downtown Branch',
    'Grace Hopper deactivated user Edsger Dijkstra',
    'Barbara Liskov exported the customers list',
  ];

  protected cards: IDashboardCard[] = [
    { label: 'Users', value: `${USERS.length}`, icon: 'fa-user' },
    { label: 'Customers', value: `${CUSTOMERS.length}`, icon: 'fa-address-book' },
    { label: 'Units', value: `${UNITS.length}`, icon: 'fa-building' },
  ];
}

// ---------------------------------------------------------------------------
// Routes — one path segment per route, nested. RouteHelper.getRouteURL() collects each
// route's segments walking up the parent chain and then reverses the flat list, so a
// multi-segment path like 'general/customers' would rebuild as '/customers/general' and
// break the URLs that ButtonNew/ButtonOpenRecord/ButtonSave construct.
// ---------------------------------------------------------------------------

const showcaseRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DefaultTabViewComponent,
    data: { [FRAMEWORK_VIEW_TYPE]: FrameworkViewType.List },
    children: [
      { path: '', component: DashboardComponent },
    ],
  },
  // Storybook bootstraps the app at /iframe.html, which matches none of the routes above.
  // This catch-all lands the story on the dashboard instead of relying on TabsComponent's
  // fallback redirect. Keep it LAST — Angular matches routes in order.
  { path: '**', redirectTo: 'dashboard' },
];

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

// Story-only: constrain the layout to its container (the app uses full-viewport sizing,
// which forces a scrollbar inside the Storybook canvas).
const FIT_TO_CONTAINER = `
  <style>
    ::ng-deep shared-main-layout { display: block; height: 100%; max-height: 100%; }
    ::ng-deep shared-main-layout .main-container { max-height: 100% !important; }
  </style>
`;

const meta: Meta<MainLayoutComponent> = {
  component: MainLayoutComponent,
  decorators: [
    applicationConfig({
      providers: [
        // Adds the showcase routes to the router configured globally in
        // tools/storybook/storybook.providers.ts (which registers an empty route table).
        { provide: ROUTES, multi: true, useValue: showcaseRoutes },
        TabService,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        { provide: SidebarService, useClass: ShowcaseSidebarService },
      ],
    }),
  ],
  title: 'Shared/App Showcase',
};
export default meta;

export const NavigableApp: StoryObj<MainLayoutComponent> = {
  render: () => ({
    template: `
      ${FIT_TO_CONTAINER}
      <div class="h-[40rem] bg-slate-100">
        <shared-main-layout></shared-main-layout>
      </div>
    `,
  }),
};
