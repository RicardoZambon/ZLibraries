import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OnPushRender, renderUnderOnPush } from '@zambon-dev/library/testing';
import { Tab } from '../../../models';
import { CustomReuseStrategy } from '../../../services/custom-reuse-strategy';
import { TabService } from '../../../services/tab.service';
import { TabBreadcrumbsComponent } from './tab-breadcrumbs.component';

/**
 * The component the guide names as the clearest case of the trap: a `protected get` over an
 * array a service mutates elsewhere. Rendered beneath a clean OnPush ancestor, it is only
 * correct because TabService announces its own changes.
 */
describe(`${TabBreadcrumbsComponent.name} under an OnPush ancestor`, () => {
  let render: OnPushRender<TabBreadcrumbsComponent>;
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

    render = renderUnderOnPush(TabBreadcrumbsComponent);
    tabService = TestBed.inject(TabService);
  });

  it('renders a trail for a tab opened after the first paint', () => {
    tabService.openTab(new Tab({ isTitleLoading: false, title: 'Employees', url: '/security/employees' }));
    render.tick();

    expect(render.element.textContent).toContain('Employees');
  });

  it('picks up a title that resolves after the trail is on screen', () => {
    tabService.openTab(new Tab({ isTitleLoading: true, url: '/security/employees/9' }));
    render.tick();

    tabService.updateTabTitle('/security/employees/9', 'Ada Lovelace');
    render.tick();

    expect(render.element.textContent).toContain('Ada Lovelace');
  });
});
