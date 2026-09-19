import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../../../services';
import { TranslateModule } from '@ngx-translate/core';
import { LoginComponent } from './login.component';

describe(LoginComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent, TranslateModule.forRoot()],
      providers: [{ provide: AuthenticationService, useValue: { isAuthenticated: false } }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<LoginComponent> = TestBed.createComponent(LoginComponent);
    const component: LoginComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
