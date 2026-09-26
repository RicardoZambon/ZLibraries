import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { APP_CONFIG, AuthService } from '@zambon-dev/framework';
import { DataGridDataset, GridConfigsProvider } from '@zambon-dev/library';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ServicesHistoryDataset } from '../../../datasets';
import { ServicesHistoryFilterComponent } from './services-history-filter.component';

describe(ServicesHistoryFilterComponent.name, () => {
  let fixture: ComponentFixture<ServicesHistoryFilterComponent>;
  let component: ServicesHistoryFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesHistoryFilterComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        GridConfigsProvider,
        { provide: DataGridDataset, useClass: ServicesHistoryDataset },
        { provide: APP_CONFIG, useValue: { BASE_URL: '', version: '0.0.0-test' } },
        { provide: AuthService, useValue: { checkActionsAreAllowed: () => of([true]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesHistoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('names its controls after the filters the backend reads', () => {
    // These are the AuditFilters names in ZWebAPI, matched case insensitively. A rename on either
    // side is a filter that is silently ignored, so the two are pinned together here.
    expect(Object.keys((<any>component).filterForm.controls).sort()).toEqual([
      'changedByID',
      'changedOnFrom',
      'changedOnTo',
      'name',
      'onlyCurrentEntity',
    ]);
  });

  it('pulls the later bound back when the earlier one passes it', () => {
    const form: any = (<any>component).filterForm;

    form.get('changedOnTo').setValue('2026-03-05');
    form.get('changedOnFrom').setValue('2026-03-20');

    expect(form.get('changedOnTo').value).toBe('2026-03-20');
  });

  it('pushes the earlier bound back when the later one precedes it', () => {
    const form: any = (<any>component).filterForm;

    form.get('changedOnFrom').setValue('2026-03-20');
    form.get('changedOnTo').setValue('2026-03-05');

    expect(form.get('changedOnFrom').value).toBe('2026-03-05');
  });

  it('leaves a range that already reads forwards alone', () => {
    const form: any = (<any>component).filterForm;

    form.get('changedOnFrom').setValue('2026-03-05');
    form.get('changedOnTo').setValue('2026-03-20');

    expect(form.get('changedOnFrom').value).toBe('2026-03-05');
    expect(form.get('changedOnTo').value).toBe('2026-03-20');
  });

  it('offers the author filter only once a catalog is supplied', () => {
    // Queried on the document, not the fixture: the filter fields are projected into lib-modal,
    // which moves its own host to <body> so a dialog is not trapped in the tab panel's stacking
    // context. They are rendered, just no longer under this fixture's element.
    expect(document.querySelector('lib-catalog-select')).toBeNull();

    component.usersCatalogEndpoint = 'https://example.test/api/Employees/Catalog';
    fixture.detectChanges();

    expect(document.querySelector('lib-catalog-select')).not.toBeNull();
  });

  afterEach(() => fixture.destroy());
});
