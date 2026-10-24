import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FormGroupComponent } from './form-group.component';

describe(FormGroupComponent.name, () => {
  let fixture: ComponentFixture<FormGroupComponent>;
  let component: FormGroupComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormGroupComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FormGroupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no title when no label is set', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('h3.title'))).toBeNull();
  });

  // The component is OnPush: an input set through setInput must still reach the
  // view. A plain field assignment would not mark it dirty.
  it('should render the label when it is set as an input', () => {
    fixture.componentRef.setInput('label', 'Group label');
    fixture.detectChanges();

    const title: HTMLElement = fixture.debugElement.query(By.css('h3.title')).nativeElement;
    expect(title.textContent?.trim()).toBe('Group label');
  });

  it('should re-render when the label changes', () => {
    fixture.componentRef.setInput('label', 'First');
    fixture.detectChanges();

    fixture.componentRef.setInput('label', 'Second');
    fixture.detectChanges();

    const title: HTMLElement = fixture.debugElement.query(By.css('h3.title')).nativeElement;
    expect(title.textContent?.trim()).toBe('Second');
  });

  it('should reflect shouldExpand on the host', () => {
    fixture.componentRef.setInput('shouldExpand', true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList).toContain('expand');
  });
});
