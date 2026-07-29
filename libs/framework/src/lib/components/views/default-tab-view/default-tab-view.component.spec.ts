import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TabViewService } from '../../../services';
import { DefaultTabViewComponent } from './default-tab-view.component';

@Component({
  imports: [DefaultTabViewComponent],
  template: `
    <framework-default-tab-view></framework-default-tab-view>

    <ng-template #ribbon>
      <button class="ribbon-button" type="button">Save</button>
    </ng-template>
  `,
})
class HostComponent {
  @ViewChild('ribbon', { static: true }) public ribbonTemplate!: TemplateRef<any>;
}

describe(DefaultTabViewComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ DefaultTabViewComponent, HostComponent ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<DefaultTabViewComponent> = TestBed.createComponent(DefaultTabViewComponent);
    const component: DefaultTabViewComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  // Regression: the ribbon outlet was bound to a property that stayed `undefined` through the
  // first check and was then reassigned in ngAfterViewInit, which trips NG0100 in dev mode.
  it('should render without ExpressionChangedAfterItHasBeenCheckedError when no view publishes a ribbon', () => {
    const fixture: ComponentFixture<DefaultTabViewComponent> = TestBed.createComponent(DefaultTabViewComponent);

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render an empty ribbon when no view publishes a ribbon template', () => {
    const fixture: ComponentFixture<DefaultTabViewComponent> = TestBed.createComponent(DefaultTabViewComponent);
    fixture.detectChanges();

    const ribbon: HTMLElement = fixture.debugElement.query(By.css('lib-ribbon')).nativeElement;

    expect(ribbon.textContent?.trim()).toBe('');
  });

  it('should render a ribbon template published by a view immediately', () => {
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const tabView = fixture.debugElement.query(By.directive(DefaultTabViewComponent));
    const tabViewService: TabViewService = tabView.injector.get(TabViewService);

    // No further fixture.detectChanges() — the ribbon must be rendered by the time the call
    // returns, so buttons appear without waiting for the next change detection cycle.
    tabViewService.updateRibbonTemplate(fixture.componentInstance.ribbonTemplate);

    expect(tabView.nativeElement.querySelector('.ribbon-button')).toBeTruthy();
  });

  it('should keep the rendered ribbon until the next change detection when a view publishes no ribbon', () => {
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const tabView = fixture.debugElement.query(By.directive(DefaultTabViewComponent));
    const tabViewService: TabViewService = tabView.injector.get(TabViewService);

    tabViewService.updateRibbonTemplate(fixture.componentInstance.ribbonTemplate);
    tabViewService.updateRibbonTemplate(undefined);

    // Clearing is deferred so switching views does not tear the ribbon down for a frame
    // before the incoming view publishes its own template.
    expect(tabView.nativeElement.querySelector('.ribbon-button')).toBeTruthy();

    fixture.detectChanges();

    expect(tabView.nativeElement.querySelector('.ribbon-button')).toBeFalsy();
  });
});
