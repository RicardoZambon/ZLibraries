import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultDetailsTabViewComponent } from './default-details-tab-view.component';

describe(DefaultDetailsTabViewComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultDetailsTabViewComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<DefaultDetailsTabViewComponent> = TestBed.createComponent(DefaultDetailsTabViewComponent);
    const component: DefaultDetailsTabViewComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});