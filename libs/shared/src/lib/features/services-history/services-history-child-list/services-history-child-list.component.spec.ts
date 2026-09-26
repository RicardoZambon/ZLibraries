import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DataGridDataset, GridConfigsProvider } from '@zambon-dev/library';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesHistoryDataset } from '../../../datasets';
import { ServicesHistoryChildListComponent } from './services-history-child-list.component';

describe(ServicesHistoryChildListComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ServicesHistoryChildListComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        GridConfigsProvider,
        // Provided by ServicesHistoryViewComponent in the application, so that the ribbon's
        // buttons and this grid share one instance -- which is why this component no longer
        // provides its own.
        { provide: DataGridDataset, useClass: ServicesHistoryDataset },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ServicesHistoryChildListComponent> = TestBed.createComponent(
      ServicesHistoryChildListComponent,
    );
    const component: ServicesHistoryChildListComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
