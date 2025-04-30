import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationsHistoryChildListComponent } from './operations-history-child-list.component';

describe(OperationsHistoryChildListComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationsHistoryChildListComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<OperationsHistoryChildListComponent> = TestBed.createComponent(OperationsHistoryChildListComponent);
    const component: OperationsHistoryChildListComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});