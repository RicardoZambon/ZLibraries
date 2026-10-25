import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_CONFIG, AppConfig } from '@zambon-dev/ui/framework';
import { LoginLayoutComponent } from './login-layout.component';

describe(LoginLayoutComponent.name, () => {
  function render(loginBackgroundUrl?: string): ComponentFixture<LoginLayoutComponent> {
    TestBed.configureTestingModule({
      imports: [LoginLayoutComponent],
      providers: [{ provide: APP_CONFIG, useValue: new AppConfig('/api', { loginBackgroundUrl }) }],
    });

    const fixture: ComponentFixture<LoginLayoutComponent> = TestBed.createComponent(LoginLayoutComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(render().componentInstance).toBeTruthy();
  });

  // The class is what gives the sign-in footer a surface of its own: over a photograph the footer's
  // text sits on whatever the picture has there, and without one it was unreadable.
  it('marks itself when a background photograph is configured', () => {
    const fixture: ComponentFixture<LoginLayoutComponent> = render('/background.jpg');

    expect(fixture.nativeElement.classList.contains('has-background')).toBe(true);
    expect(fixture.nativeElement.querySelector('.background')).not.toBeNull();
  });

  it('stays unmarked without one', () => {
    const fixture: ComponentFixture<LoginLayoutComponent> = render();

    expect(fixture.nativeElement.classList.contains('has-background')).toBe(false);
    expect(fixture.nativeElement.querySelector('.background')).toBeNull();
  });
});
