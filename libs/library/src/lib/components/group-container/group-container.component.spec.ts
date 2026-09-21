import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { GroupContainerComponent } from './group-container.component';

describe(GroupContainerComponent.name, () => {
  let fixture: ComponentFixture<GroupContainerComponent>;
  let component: GroupContainerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupContainerComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupContainerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a placeholder while no title is set', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.title svg'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.title h4'))).toBeNull();
  });

  // The component is OnPush: inputs must still drive the view.
  it('should render the title once it is set', () => {
    fixture.componentRef.setInput('title', 'Section');
    fixture.detectChanges();

    const heading: HTMLElement = fixture.debugElement.query(By.css('.title h4')).nativeElement;
    expect(heading.textContent?.trim()).toBe('Section');
    expect(fixture.debugElement.query(By.css('.title svg'))).toBeNull();
  });

  it('should render the icon only alongside a title', () => {
    fixture.componentRef.setInput('icon', 'fa-user');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.title i'))).toBeNull();

    fixture.componentRef.setInput('title', 'Section');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.title i'))).toBeTruthy();
  });

  it('should report no titles when it holds no accordion sections', () => {
    fixture.detectChanges();

    expect(component.titles).toEqual([]);
  });
});
