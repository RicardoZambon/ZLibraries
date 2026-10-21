import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { OnPushRender, renderUnderOnPush } from '../../../testing';
import { ISidebarProfile, SIDEBAR_CONFIGS, SidebarConfigs, SidebarMenu } from '../../models';
import { SidebarService } from '../../services';
import { SidebarComponent } from './sidebar.component';

/**
 * The regression test for the failure reported from SecurityHub: after login the sidebar showed
 * its loading spinner forever and only filled in once the user clicked something. The state was
 * right and the DOM was empty.
 *
 * The existing sidebar spec cannot express it, twice over -- its mock answers with `of(...)`,
 * which emits inside `ngOnInit` and therefore inside the first paint, and it renders the component
 * as the fixture root, whose host view is CheckAlways and refreshes it unconditionally. Here the
 * menus arrive after the first paint, beneath a clean OnPush ancestor, which is what a consumer
 * application actually is.
 */

/** Resolves when the spec says so, never inside `ngOnInit`. */
let rootMenus: Subject<SidebarMenu[]>;

@Injectable()
class AsyncSidebarService extends SidebarService {
  public getMenuFromUrl(_url: string): Observable<SidebarMenu> {
    return EMPTY;
  }

  public getUserProfile(): ISidebarProfile | undefined {
    return undefined;
  }

  protected loadMenus(_parentMenu: SidebarMenu | null): Observable<SidebarMenu[]> {
    return rootMenus.asObservable();
  }
}

describe(`${SidebarComponent.name} under an OnPush ancestor`, () => {
  let render: OnPushRender<SidebarComponent>;

  beforeEach(() => {
    rootMenus = new Subject<SidebarMenu[]>();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: SidebarService, useClass: AsyncSidebarService },
        { provide: SIDEBAR_CONFIGS, useValue: new SidebarConfigs() },
      ],
    });

    render = renderUnderOnPush(SidebarComponent);
  });

  it('shows the loading state until the menus arrive', () => {
    expect(render.element.querySelector('.loading')).not.toBeNull();
    expect(render.element.querySelectorAll('lib-sidebar-item')).toHaveLength(0);
  });

  it('renders the menus that arrive after the first paint', () => {
    rootMenus.next([
      new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard' }),
      new SidebarMenu({ id: 2, label: 'Employees', icon: 'fa-users', url: '/employees' }),
    ]);
    render.tick();

    expect(render.element.querySelector('.loading')).toBeNull();
    expect(render.element.querySelectorAll('lib-sidebar-item')).toHaveLength(2);
  });
});
