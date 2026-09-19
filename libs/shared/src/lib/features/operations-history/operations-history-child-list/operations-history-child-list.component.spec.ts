import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GridConfigsProvider } from '@zambon-dev/library';
import { TranslateModule } from '@ngx-translate/core';
import { OperationsHistoryChildListComponent } from './operations-history-child-list.component';

describe(OperationsHistoryChildListComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OperationsHistoryChildListComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), GridConfigsProvider],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<OperationsHistoryChildListComponent> = TestBed.createComponent(
      OperationsHistoryChildListComponent
    );
    const component: OperationsHistoryChildListComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
