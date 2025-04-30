import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { ITabView } from '../../models';
import { TabService } from '../../services';
import { TabBreadcrumbsComponent } from '../tab-breadcrumbs/tab-breadcrumbs.component';
import { TabsComponent } from './tabs.component';

describe(TabsComponent.name, () => {
  // let tabServiceSpy: jasmine.SpyObj<TabService>;

  // const openTabs: string[] = [];
  // const openViews: ITabView[] = [];

  // beforeEach(async () => {s
  //   tabServiceSpy = jasmine.createSpyObj<TabService>(TabService.name, [ 'closeTab', 'focusTab' ], { openTabs: openTabs, openViews: openViews });
  //   tabServiceSpy.closeTab.and.callThrough();
  //   tabServiceSpy.focusTab.and.callThrough();

  //   await TestBed.configureTestingModule({
  //     declarations: [ TabsComponent, TabBreadcrumbsComponent ],
  //     imports: [
  //       CommonModule,
  //       TranslateModule.forRoot(),
  //     ],
  //     providers: [
  //       { provide: TabService, useValue: tabServiceSpy }
  //     ],
  //   })
  //   .compileComponents();
  // });

  // it('should create', () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   expect(component).toBeTruthy();
  // });

  // it('should close tab when clicked close button', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const tabCloseDebug: DebugElement = fixture.debugElement.query(By.css('.tabs-nav li .tab-close'));
  //   expect(tabCloseDebug).toBeTruthy();

  //   const tabClose: HTMLAnchorElement = tabCloseDebug.nativeElement;
  //   expect(tabClose).toBeTruthy();

  //   tabClose.dispatchEvent(new Event('click'));
  //   expect(tabServiceSpy.closeTab).toHaveBeenCalledOnceWith(openViews[0]);
  // });

  // it('should display as active tab currently selected tab', async () => {
  //   const activeTab: string = '/test1';

  //   const tabServiceSpyCustom = jasmine.createSpyObj<TabService>(TabService.name, [], { openTabs: openTabs, openViews: openViews, activeTab: activeTab });
  //   TestBed.overrideProvider(TabService,{ useValue: tabServiceSpyCustom });

  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');
  //   openTabs.push('/test1');
  //   openTabs.push('/test2');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});
  //   openViews.push({title: 'Test 1', url: '/test1'});
  //   openViews.push({title: 'Test 2', url: '/test2'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const titleDebug: DebugElement = fixture.debugElement.query(By.css('.tabs-nav li.active .tab-item span'));
  //   expect(titleDebug).toBeTruthy();

  //   const title: HTMLSpanElement = titleDebug.nativeElement;
  //   expect(title).toBeTruthy();
  //   expect(title.textContent).toBe(openViews.find(x => x.url === activeTab)!.title);
  // });

  // it('should display tab title', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const titleDebug: DebugElement = fixture.debugElement.query(By.css('.tab-item span'));
  //   expect(titleDebug).toBeTruthy();

  //   const title: HTMLSpanElement = titleDebug.nativeElement;
  //   expect(title).toBeTruthy();
  //   expect(title.textContent).toBe(openViews[0].title);
  // });

  // it('should display tabs when has open tabs', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const tabItemsDebug: DebugElement[] = fixture.debugElement.queryAll(By.css('.tabs-nav li'));
  //   expect(tabItemsDebug.length).toBe(openTabs.length);
  // });

  // it('should display title loading when tab has no title set', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');

  //   openViews.length = 0;
  //   openViews.push({title: '', url: '/home'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const svgDebug: DebugElement = fixture.debugElement.query(By.css('.tab-item svg'));
  //   expect(svgDebug).toBeTruthy();

  //   const svg: SVGImageElement = svgDebug.nativeElement;
  //   expect(svg).toBeTruthy();
  // });

  // it('should focus tab when clicked tab item', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const tabItemDebug: DebugElement = fixture.debugElement.query(By.css('.tabs-nav li .tab-item'));
  //   expect(tabItemDebug).toBeTruthy();

  //   const tabItem: HTMLAnchorElement = tabItemDebug.nativeElement;
  //   expect(tabItem).toBeTruthy();

  //   tabItem.dispatchEvent(new Event('click'));
  //   expect(tabServiceSpy.focusTab).toHaveBeenCalledOnceWith(openViews[0].url);
  // });

  // it('should hide title loading when tab title set', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const svgDebug: DebugElement = fixture.debugElement.query(By.css('.tab-item svg'));
  //   expect(svgDebug).toBeFalsy();
  // });

  // it('should hide tab-content when has no tabs', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openViews.length = 0;

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const tabContentDebug: DebugElement = fixture.debugElement.query(By.css('.tab-content'));
  //   expect(tabContentDebug).toBeFalsy();
  // });

  // it('should only display tabs for open views', () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');
  //   openTabs.push('/test1');
  //   openTabs.push('/test2');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});
  //   openViews.push({title: 'Test 1', url: '/test1'});

  //   expect(component.openTabs.length).toBe(openTabs.length);
  // });

  // it('should show tab-content when has tabs', async () => {
  //   const fixture: ComponentFixture<TabsComponent> = TestBed.createComponent(TabsComponent);
  //   const component: TabsComponent = fixture.componentInstance;

  //   openTabs.length = 0;
  //   openTabs.push('/home');

  //   openViews.length = 0;
  //   openViews.push({title: 'Home', url: '/home'});

  //   expect(component.openTabs.length).toBe(openTabs.length);

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const tabContentDebug: DebugElement = fixture.debugElement.query(By.css('.tab-content'));
  //   expect(tabContentDebug).toBeTruthy();

  //   const tabContent: HTMLDivElement = tabContentDebug.nativeElement;
  //   expect(tabContent).toBeTruthy();
  // });
});