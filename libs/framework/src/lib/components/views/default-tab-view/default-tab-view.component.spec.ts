import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TabViewService } from '../../../services';
import { DefaultTabViewComponent } from './default-tab-view.component';

@Component({
  imports: [DefaultTabViewComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
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
      imports: [DefaultTabViewComponent, HostComponent],
    }).compileComponents();
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

  // Regression: a child view publishes its ribbon from ngAfterViewInit, and the router only names
  // the active view afterwards, so the first template of a tab is cached under an empty id. Looking
  // it up later under the real name missed and emptied the ribbon -- for good, because a tab being
  // re-activated has its child re-attached rather than re-created, so nothing ever publishes again.
  // That is what left a details tab with child views showing no buttons after visiting another tab.
  it('keeps a ribbon published before the active view had a name', () => {
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const view: DefaultTabViewComponent = fixture.debugElement.query(
      By.directive(DefaultTabViewComponent),
    ).componentInstance;
    const service: TabViewService = fixture.debugElement
      .query(By.directive(DefaultTabViewComponent))
      .injector.get(TabViewService);

    // The child publishes while the view is still unnamed, exactly as ngAfterViewInit does.
    service.updateRibbonTemplate(fixture.componentInstance.ribbonTemplate);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ribbon-button'))).not.toBeNull();

    // The router then names it, which is what used to drop the ribbon.
    service.setActiveView('items');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ribbon-button'))).not.toBeNull();
    expect(view).toBeTruthy();
  });

  // Regression: the claim above used to fire on every naming, not just the first. On a tab that
  // opens at its default view -- whose own id is the empty one, since its URL carries no sub-path
  // -- switching to a second view handed that default view's template to the incoming one. The
  // new view showed the old buttons, and going back showed none, because the entry had been moved
  // away from the id the default view is looked up under.
  it('leaves the default view its ribbon when another view is opened', () => {
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const service: TabViewService = fixture.debugElement
      .query(By.directive(DefaultTabViewComponent))
      .injector.get(TabViewService);

    // The default view publishes from ngAfterViewInit, before it is named.
    service.updateRibbonTemplate(fixture.componentInstance.ribbonTemplate);
    service.setActiveView('');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ribbon-button'))).not.toBeNull();

    // A second view that publishes no ribbon of its own must show no buttons.
    service.setActiveView('audit');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ribbon-button'))).toBeNull();

    // And coming back must restore the default view's own buttons.
    service.setActiveView('');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ribbon-button'))).not.toBeNull();
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
