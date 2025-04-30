import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicesHistoryViewComponent } from './services-history-view.component';

describe(ServicesHistoryViewComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicesHistoryViewComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ServicesHistoryViewComponent> = TestBed.createComponent(ServicesHistoryViewComponent);
    const component: ServicesHistoryViewComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});