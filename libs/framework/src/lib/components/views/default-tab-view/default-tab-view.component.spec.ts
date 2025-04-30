import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultTabViewComponent } from './default-tab-view.component';

describe(DefaultTabViewComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultTabViewComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<DefaultTabViewComponent> = TestBed.createComponent(DefaultTabViewComponent);
    const component: DefaultTabViewComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});