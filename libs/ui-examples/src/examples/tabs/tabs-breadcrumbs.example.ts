import { Component, inject } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy, Tab, TabsComponent, TabService } from '@zambon-dev/ui/framework';

/**
 * The tab strip of a multi-tab application. A tab that opened a sub-view shows the trail back to
 * its root as breadcrumbs. In an application the router opens tabs; here the constructor does.
 */
@Component({
  selector: 'example-tabs-breadcrumbs',
  imports: [TabsComponent],
  providers: [TabService, { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
  template: `
    <div class="h-80 bg-white">
      <framework-tabs>
        <div class="p-4 text-sm text-slate-700">Active tab content is rendered by routed views in the application.</div>
      </framework-tabs>
    </div>
  `,
})
export class TabsBreadcrumbsExample {
  private readonly tabService = inject(TabService);

  constructor() {
    this.tabService.closeAllTabs();
    this.tabService.openTab(new Tab({ title: 'Commissions', url: '/finance/commissions', isTitleLoading: false }));
    this.tabService.openTab(new Tab({ title: 'Customers', url: '/general/customers', isTitleLoading: false }));
    this.tabService.openTab(new Tab({ title: 'Settings', url: '/security/settings', isTitleLoading: false }));
    this.tabService.replaceCurrentTabSubView(
      '/security/settings',
      new Tab({ title: 'Audit', url: '/security/settings/audit', isTitleLoading: false }),
    );
  }
}
