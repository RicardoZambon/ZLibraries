import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorModalComponent } from './error-modal.component';

describe(ErrorModalComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ErrorModalComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<ErrorModalComponent> = TestBed.createComponent(ErrorModalComponent);
    const component: ErrorModalComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});