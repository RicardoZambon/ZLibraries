import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';

describe(MainLayoutComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ MainLayoutComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<MainLayoutComponent> = TestBed.createComponent(MainLayoutComponent);
    const component: MainLayoutComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});