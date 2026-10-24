import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DataGridDataset } from '@zambon-dev/ui/library';
import { TranslateModule } from '@ngx-translate/core';
import { OnPushRender, renderUnderOnPush } from '@zambon-dev/ui/testing';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../../services';
import { ButtonComponent } from './button/button.component';
import { ButtonOpenRecordComponent } from './button-open-record/button-open-record.component';
import { ButtonRefreshComponent } from './button-refresh/button-refresh.component';

/**
 * Every ribbon button answers to something that arrives after the first paint: an access check
 * resolving, a grid announcing a selection, a load finishing. Under a clean OnPush ancestor --
 * which is what a consuming application leaves above the ribbon -- none of that reaches the
 * screen unless the component notifies Angular.
 *
 * The access check is driven through a Subject the spec controls rather than `of(...)`, which
 * would resolve inside the first paint and let any strategy pass.
 */
describe('The ribbon buttons under an OnPush ancestor', () => {
  let allowed$: Subject<boolean[]>;
  let selectedRowKeys: string[];
  let selectedRowsChanged: Subject<void>;
  let loadFinished: Subject<boolean>;

  beforeEach(() => {
    allowed$ = new Subject<boolean[]>();
    selectedRowKeys = [];
    selectedRowsChanged = new Subject<void>();
    loadFinished = new Subject<boolean>();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { checkActionsAreAllowed: (): Observable<boolean[]> => allowed$.asObservable() },
        },
        {
          provide: DataGridDataset,
          useValue: {
            get selectedRowKeys(): string[] {
              return selectedRowKeys;
            },
            getRowID: (key: string): string => key,
            loadFinished,
            refresh: (): void => undefined,
            selectedRowsChanged,
          },
        },
      ],
    });
  });

  it('hides a button whose access check comes back denied', () => {
    const render: OnPushRender<ButtonComponent> = renderUnderOnPush(ButtonComponent, {
      allowedActions: ['Employees.Read'],
      label: 'Open',
    });

    expect(render.element.textContent).toContain('Open');

    allowed$.next([false]);
    render.tick();

    expect(render.element.textContent).not.toContain('Open');
  });

  it('enables Open record once the grid announces a single selected row', () => {
    const render: OnPushRender<ButtonOpenRecordComponent> = renderUnderOnPush(ButtonOpenRecordComponent);

    expect(render.element.querySelector('.button.disabled')).not.toBeNull();

    selectedRowKeys = ['key-325'];
    selectedRowsChanged.next();
    render.tick();

    expect(render.element.querySelector('.button.disabled')).toBeNull();
  });

  it('clears the Refresh spinner when the grid reports the load has finished', () => {
    const render: OnPushRender<ButtonRefreshComponent> = renderUnderOnPush(ButtonRefreshComponent);

    render.element.querySelector<HTMLElement>('.button')!.click();
    render.tick();

    expect(render.element.querySelector('.icon.loading')).not.toBeNull();

    loadFinished.next(true);
    render.tick();

    expect(render.element.querySelector('.icon.loading')).toBeNull();
  });
});
