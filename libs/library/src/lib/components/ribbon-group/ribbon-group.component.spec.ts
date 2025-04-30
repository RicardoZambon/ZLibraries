import { CommonModule } from '@angular/common';
import { Component, DebugElement, ViewChild, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RibbonGroupChild } from '../../models';
import { RibbonGroupComponent } from './ribbon-group.component';

describe(RibbonGroupComponent.name, () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RibbonGroupComponent ],
      imports: [
        CommonModule,
      ],
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<RibbonGroupComponent> = TestBed.createComponent(RibbonGroupComponent);
    const component: RibbonGroupComponent = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
  
  it('should have children content when has children buttons', async () => {
    TestBed.configureTestingModule({
      declarations: [
        RibbonGroupTestComponent,
        RibbonGroupButtonTestComponent,
        RibbonGroupComponent,
      ],
      imports: [
        CommonModule,
      ],
    })
    .compileComponents();

    const fixture: ComponentFixture<RibbonGroupTestComponent> = TestBed.createComponent(RibbonGroupTestComponent);
    const component: RibbonGroupTestComponent = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.ribbonGroupComponent).toBeTruthy();

    expect(component.ribbonGroupComponent?.children).toBeTruthy();
    expect(component.ribbonGroupComponent?.children?.length).toBe(1);
  });

  it('should remain visible when children are visible', async () => {
    TestBed.configureTestingModule({
      declarations: [
        RibbonGroupTestComponent,
        RibbonGroupButtonTestComponent,
        RibbonGroupComponent,
      ],
      imports: [
        CommonModule,
      ],
    })
    .compileComponents();

    const fixture: ComponentFixture<RibbonGroupTestComponent> = TestBed.createComponent(RibbonGroupTestComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const ribbonGroupDebugElement: DebugElement = fixture.debugElement.query(By.directive(RibbonGroupComponent));
    expect(ribbonGroupDebugElement).toBeTruthy();

    const ribbonGroupElement: HTMLElement = ribbonGroupDebugElement.nativeElement;
    expect(ribbonGroupElement.classList).not.toContain('hidden');
  });

  it('should set label', async () => {
    const fixture: ComponentFixture<RibbonGroupComponent> = TestBed.createComponent(RibbonGroupComponent);
    const component: RibbonGroupComponent = fixture.componentInstance;

    component.label = 'Group title';

    fixture.detectChanges();
    await fixture.whenStable();

    const labelDebugElement: DebugElement = fixture.debugElement.query(By.css('div.label'));
    expect(labelDebugElement).toBeTruthy();

    const label: HTMLDivElement = labelDebugElement.nativeElement;
    expect(label).toBeTruthy();
    expect(label.innerText).toBe(component.label);
  });

  it('should stay hidden when children are NOT visible', async () => {
    TestBed.configureTestingModule({
      declarations: [
        RibbonGroupTestComponent,
        RibbonGroupButtonTestComponent,
        RibbonGroupComponent,
      ],
      imports: [
        CommonModule,
      ],
    })
    .compileComponents();

    const fixture: ComponentFixture<RibbonGroupTestComponent> = TestBed.createComponent(RibbonGroupTestComponent);
    const component: RibbonGroupTestComponent = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();

    const ribbonGroupChild: RibbonGroupChild = <RibbonGroupChild>component.ribbonGroupComponent?.children?.get(0);
    expect(ribbonGroupChild).toBeTruthy();

    ribbonGroupChild.visible = false;
    fixture.detectChanges();
    await fixture.whenStable();

    const ribbonGroupDebugElement: DebugElement = fixture.debugElement.query(By.directive(RibbonGroupComponent));
    expect(ribbonGroupDebugElement).toBeTruthy();

    const ribbonGroupElement: HTMLElement = ribbonGroupDebugElement.nativeElement;
    expect(ribbonGroupElement.classList).toContain('hidden');
  });
});

@Component({
  selector: 'test-ribbon-button',
  template: ``,
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => RibbonGroupButtonTestComponent)}],
})
class RibbonGroupButtonTestComponent extends RibbonGroupChild {
  public visible: boolean = true;
}

@Component({ template: `
<lib-ribbon-group>
  <test-ribbon-button></test-ribbon-button>
</lib-ribbon-group>
` })
class RibbonGroupTestComponent {
  @ViewChild(RibbonGroupComponent) ribbonGroupComponent?: RibbonGroupComponent;
}