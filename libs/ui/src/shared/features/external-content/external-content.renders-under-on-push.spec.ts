import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TabService, TabViewService } from '@zambon-dev/ui/framework';
import { TranslateModule } from '@ngx-translate/core';
import { OnPushRender, renderUnderOnPush } from '@zambon-dev/ui/testing';
import { Observable, Subject } from 'rxjs';
import { IExternalContentEntry } from '../../models';
import { ExternalContentService, ExternalUrlResolverService } from '../../services';
import { ExternalContentComponent } from './external-content.component';

/**
 * This screen decides everything it shows after its first paint: the menu lookup resolves, and
 * only then does it know whether to frame the destination, block it, or say it is unavailable.
 *
 * The lookup is a Subject the spec controls rather than `of(...)`, which would resolve inside
 * `ngOnInit` -- that is, inside the first paint -- and let any strategy pass.
 */
describe(`${ExternalContentComponent.name} under an OnPush ancestor`, () => {
  let found$: Subject<IExternalContentEntry | undefined>;

  beforeEach(() => {
    found$ = new Subject<IExternalContentEntry | undefined>();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (): string => '1' } } } },
        {
          provide: ExternalContentService,
          useValue: { find: (): Observable<IExternalContentEntry | undefined> => found$.asObservable() },
        },
        {
          provide: ExternalUrlResolverService,
          useValue: {
            isAllowed: (url: string): boolean => url.startsWith('https://'),
            resolve: (url: string): string => url,
          },
        },
        { provide: TabService, useValue: { updateActiveTabRootTitle: (): void => undefined } },
        { provide: TabViewService, useValue: { updateRibbonTemplate: (): void => undefined } },
      ],
    });
  });

  it('frames the destination once the lookup answers', () => {
    const render: OnPushRender<ExternalContentComponent> = renderUnderOnPush(ExternalContentComponent);

    expect(render.element.querySelector('iframe')).toBeNull();

    found$.next({ id: 1, label: 'Monthly report', url: 'https://reports.example.com/r' });
    render.tick();

    expect(render.element.querySelector('iframe')?.getAttribute('src')).toBe('https://reports.example.com/r');
  });

  it('says so when the lookup answers with nothing', () => {
    const render: OnPushRender<ExternalContentComponent> = renderUnderOnPush(ExternalContentComponent);

    found$.next(undefined);
    render.tick();

    expect(render.element.textContent).toContain('ExternalContent-Unavailable-Title');
  });
});
