import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a real button so a click bubbles to the host', () => {
    const seen: Event[] = [];
    fixture.nativeElement.addEventListener('click', (event: Event) => seen.push(event));

    button().click();

    expect(seen).toHaveLength(1);
  });

  describe('while loading', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
    });

    it('blocks activation through the disabled attribute, not only pointer-events', () => {
      // The global class it replaces used `pointer-events: none`, which stops a mouse and lets
      // Enter through. A disabled button stops both.
      expect(button().disabled).toBe(true);
    });

    it('announces itself as busy', () => {
      expect(button().getAttribute('aria-busy')).toBe('true');
    });

    it('shows the spinner instead of the icon', () => {
      fixture.componentRef.setInput('icon', 'fa-solid fa-floppy-disk');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.lib-button-spinner')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.fa-floppy-disk')).toBeNull();
    });
  });

  it('blocks activation on success, because the action is already done', () => {
    fixture.componentRef.setInput('success', true);
    fixture.detectChanges();

    expect(button().disabled).toBe(true);
  });

  it('stays usable on error, because the action can be retried', () => {
    fixture.componentRef.setInput('error', true);
    fixture.detectChanges();

    expect(button().disabled).toBe(false);
  });

  it('is not busy when it is merely disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(button().disabled).toBe(true);
    expect(button().getAttribute('aria-busy')).toBeNull();
  });

  it('carries the intent as a class so the theme decides the colour', () => {
    fixture.componentRef.setInput('intent', 'danger');
    fixture.detectChanges();

    expect(button().classList).toContain('intent-danger');
  });

  it('passes a submit type through to the native button', () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();

    expect(button().type).toBe('submit');
  });
});
