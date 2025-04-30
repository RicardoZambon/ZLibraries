import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe(ConfirmModalComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmModalComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ConfirmModalComponent> = TestBed.createComponent(ConfirmModalComponent);
    const component: ConfirmModalComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});