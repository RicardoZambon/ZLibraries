import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GridConfigsProvider } from '@zambon-dev/library';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesHistoryChildListComponent } from './services-history-child-list.component';

describe(ServicesHistoryChildListComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ServicesHistoryChildListComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), GridConfigsProvider],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ServicesHistoryChildListComponent> = TestBed.createComponent(
      ServicesHistoryChildListComponent
    );
    const component: ServicesHistoryChildListComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
