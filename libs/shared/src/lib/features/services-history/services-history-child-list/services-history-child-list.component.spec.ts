import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicesHistoryChildListComponent } from './services-history-child-list.component';

describe(ServicesHistoryChildListComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicesHistoryChildListComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ServicesHistoryChildListComponent> = TestBed.createComponent(ServicesHistoryChildListComponent);
    const component: ServicesHistoryChildListComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});