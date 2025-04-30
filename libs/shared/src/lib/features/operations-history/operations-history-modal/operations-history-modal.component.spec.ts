import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationsHistoryModalComponent } from './operations-history-modal.component';

describe(OperationsHistoryModalComponent.name, () => {
  beforeEach(() => {OperationsHistoryModalComponent
    TestBed.configureTestingModule({
      declarations: [ OperationsHistoryModalComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<OperationsHistoryModalComponent> = TestBed.createComponent(OperationsHistoryModalComponent);
    const component: OperationsHistoryModalComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});