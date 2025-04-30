import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';

describe(LoginComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<LoginComponent> = TestBed.createComponent(LoginComponent);
    const component: LoginComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});