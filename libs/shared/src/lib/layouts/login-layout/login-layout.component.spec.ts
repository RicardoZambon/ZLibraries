import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginLayoutComponent } from './login-layout.component';

describe(LoginLayoutComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginLayoutComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<LoginLayoutComponent> = TestBed.createComponent(LoginLayoutComponent);
    const component: LoginLayoutComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});