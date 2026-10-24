import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DataProviderService, FormService } from '@zambon-dev/ui/library';
import { of } from 'rxjs';
import { AuthService } from '../../../services';
import { TranslateModule } from '@ngx-translate/core';
import { DefaultDetailsTabViewComponent } from './default-details-tab-view.component';

describe(DefaultDetailsTabViewComponent.name, () => {
  beforeEach(() => {
    // The component provides DataProviderService through a factory that reads
    // route.snapshot.data['dataProvider'], so the route has to supply one. It needs enough shape
    // to survive ngOnInit, which subscribes to the model.
    const activatedRouteStub: unknown = {
      snapshot: {
        data: {
          dataProvider: () => ({
            entityID: 1,
            hasEntityID: true,
            getError$: () => of(),
            getModel$: () => of({ id: 1 }),
            getTitle: () => 'Record',
          }),
        },
        paramMap: new Map<string, string>(),
        url: [],
      },
    };

    const authServiceStub: unknown = {
      isAuthenticated: true,
      hasAction: () => true,
    };

    TestBed.configureTestingModule({
      imports: [DefaultDetailsTabViewComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<DefaultDetailsTabViewComponent> =
      TestBed.createComponent(DefaultDetailsTabViewComponent);
    const component: DefaultDetailsTabViewComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  /**
   * What a view routed into this shell can inject.
   *
   * A record's views are siblings: the form is one route, a child list is another, and only the
   * form provides its own FormService. So anything a non-form view renders has to find one here or
   * not at all — and framework-button-edit asks for FormService and DataProviderService together.
   * Without both, opening a child-list view threw NG0201 before the component ever rendered.
   *
   * Resolved from the outlet's own injector rather than the component's, because that is the
   * position a routed child actually attaches at.
   */
  describe('what a routed view can inject', () => {
    function outletInjector(): ComponentFixture<DefaultDetailsTabViewComponent>['debugElement']['injector'] {
      const fixture: ComponentFixture<DefaultDetailsTabViewComponent> =
        TestBed.createComponent(DefaultDetailsTabViewComponent);
      fixture.detectChanges();

      return fixture.debugElement.query(By.directive(RouterOutlet)).injector;
    }

    it('provides a FormService', () => {
      expect(outletInjector().get(FormService)).toBeInstanceOf(FormService);
    });

    it('provides a DataProviderService', () => {
      expect(outletInjector().get(DataProviderService)).toBeTruthy();
    });
  });
});
