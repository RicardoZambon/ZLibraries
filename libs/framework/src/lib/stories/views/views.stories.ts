import { Component, inject } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Tab } from '../../models';
import { CustomReuseStrategy, TabService } from '../../services';
import { TabsComponent } from '../../components/views/tabs/tabs.component';

@Component({
  selector: 'framework-story-tabs-host',
  template: `
    <framework-tabs>
      <div class="p-4 text-sm text-slate-700">
        Active tab content is rendered by routed views in the application.
      </div>
    </framework-tabs>
  `,
  imports: [TabsComponent],
})
class StoryTabsHostComponent {
  private readonly tabService = inject(TabService);

  constructor() {
    this.tabService.closeAllTabs();
    this.tabService.openTab(new Tab({ title: 'Commissions', url: '/finance/commissions', isTitleLoading: false }));
    this.tabService.openTab(new Tab({ title: 'Customers', url: '/general/customers', isTitleLoading: false }));
    this.tabService.openTab(new Tab({ title: 'Settings', url: '/security/settings', isTitleLoading: false }));
    this.tabService.replaceCurrentTabSubView('/security/settings', new Tab({ title: 'Audit', url: '/security/settings/audit', isTitleLoading: false }));
  }
}

const meta: Meta<TabsComponent> = {
  component: TabsComponent,
  decorators: [
    moduleMetadata({
      imports: [StoryTabsHostComponent],
      providers: [
        TabService,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
      ],
    }),
  ],
  title: 'Framework/Views',
};
export default meta;
type Story = StoryObj<TabsComponent>;

export const TabsWithBreadcrumbs: Story = {
  render: () => ({
    template: `
      <div class="h-80 bg-white">
        <framework-story-tabs-host></framework-story-tabs-host>
      </div>
    `,
  }),
};
