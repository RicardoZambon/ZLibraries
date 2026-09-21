import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services';
import { TranslateModule } from '@ngx-translate/core';
import { DefaultDetailsTabViewComponent } from './default-details-tab-view.component';

describe(DefaultDetailsTabViewComponent.name, () => {
  beforeEach(() => {
    // The component provides DataProviderService through a factory that reads
    // route.snapshot.data['dataProvider'], so the route has to supply one.
    const activatedRouteStub: unknown = {
      snapshot: {
        data: { dataProvider: () => ({}) },
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
});
