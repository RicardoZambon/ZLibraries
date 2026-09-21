import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GridConfigsProvider } from '@zambon-dev/library';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesHistoryViewComponent } from './services-history-view.component';

describe(ServicesHistoryViewComponent.name, () => {
  beforeEach(() => {
    const activatedRouteStub: unknown = {
      snapshot: { data: {}, paramMap: new Map<string, string>(), url: [] },
    };

    TestBed.configureTestingModule({
      imports: [ServicesHistoryViewComponent, TranslateModule.forRoot()],
      providers: [
        GridConfigsProvider,
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ServicesHistoryViewComponent> =
      TestBed.createComponent(ServicesHistoryViewComponent);
    const component: ServicesHistoryViewComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
