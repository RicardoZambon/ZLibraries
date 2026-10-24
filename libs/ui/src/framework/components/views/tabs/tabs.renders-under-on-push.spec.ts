import { provideLocationMocks } from '@angular/common/testing';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OnPushRender, renderUnderOnPush } from '@zambon-dev/ui/testing';
import { Tab } from '../../../models';
import { CustomReuseStrategy } from '../../../services/custom-reuse-strategy';
import { TabService } from '../../../services/tab.service';
import { TabsComponent } from './tabs.component';

/**
 * The second instance of the reported failure, found by running SecurityHub against these
 * packages: the menu opened a tab, `TabService` held it, and the strip rendered nothing. Only
 * `ng.applyChanges` on this component brought the tab, the grid and the ribbon buttons in.
 *
 * `TabsComponent` reads the tab list through getters on a service that mutates arrays in place,
 * which is not one of OnPush's wake-up paths. The existing tabs spec cannot see it: it stubs
 * `TabService` with plain fields and renders the component as the fixture root, where the host
 * view is CheckAlways and refreshes unconditionally.
 */
describe(`${TabsComponent.name} under an OnPush ancestor`, () => {
  let render: OnPushRender<TabsComponent>;
  let tabService: TabService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        // Any URL the service navigates to has to match something, or the router throws.
        provideRouter([{ path: '**', children: [] }]),
        provideLocationMocks(),
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
      ],
    });

    render = renderUnderOnPush(TabsComponent);
    tabService = TestBed.inject(TabService);
  });

  it('renders no tab before one is opened', () => {
    expect(render.element.querySelectorAll('[role="tab"]')).toHaveLength(0);
  });

  it('renders a tab opened after the first paint', () => {
    tabService.openTab(new Tab({ isTitleLoading: false, title: 'Employees', url: '/security/employees' }));
    render.tick();

    const tabs: NodeListOf<Element> = render.element.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(1);
    expect(tabs[0].textContent).toContain('Employees');
  });

  it('renders a title that resolves after the tab is already on screen', () => {
    tabService.openTab(new Tab({ isTitleLoading: true, url: '/security/employees/9' }));
    render.tick();

    tabService.updateTabTitle('/security/employees/9', 'Ada Lovelace');
    render.tick();

    expect(render.element.querySelector('[role="tab"]')?.textContent).toContain('Ada Lovelace');
  });
});
