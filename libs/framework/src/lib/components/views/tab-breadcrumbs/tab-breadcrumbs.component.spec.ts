import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Tab } from '../../models';
import { TabService } from '../../services';
import { TabBreadcrumbsComponent } from './tab-breadcrumbs.component';

describe(TabBreadcrumbsComponent.name, () => {
  // let tabServiceSpy: jasmine.SpyObj<TabService>;

  // beforeEach(async () => {
  //   tabServiceSpy = jasmine.createSpyObj<TabService>([ 'navigateCurrentTabBack' ]);
  //   tabServiceSpy.navigateCurrentTabBack.and.callThrough();

  //   await TestBed.configureTestingModule({
  //     declarations: [ TabBreadcrumbsComponent ],
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
  //   const fixture: ComponentFixture<TabBreadcrumbsComponent> = TestBed.createComponent(TabBreadcrumbsComponent);
  //   const component: TabBreadcrumbsComponent = fixture.componentInstance;

  //   expect(component).toBeTruthy();
  // });

  // it('should display tab history', async () => {
  //   const fixture: ComponentFixture<TabBreadcrumbsComponent> = TestBed.createComponent(TabBreadcrumbsComponent);
  //   const component: TabBreadcrumbsComponent = fixture.componentInstance;

  //   tabServiceSpy['activeTabIndex'] = 0;
  //   tabServiceSpy['openTabs'] = [
  //     [
  //       new Tab({ title: 'Home', url: '/home' }),
  //       new Tab({ title: 'Test 1', url: '/test1' }),
  //       new Tab({ title: 'Test 2', url: '/test2' }),
  //     ]
  //   ];

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const titlesDebug: DebugElement[] = fixture.debugElement.queryAll(By.css('a'));
  //   expect(titlesDebug).toBeTruthy();
  //   expect(titlesDebug.length).toBe(component['tabHistory'].length);

  //   titlesDebug.forEach((title: DebugElement, index: number) => {
  //     const anchorTitle: HTMLAnchorElement = title.nativeElement;
  //     expect(anchorTitle).toBeTruthy();
  //     expect(anchorTitle.innerText).toBe(component['tabHistory'][index].title!);
  //   });
  // });

  // it('should move back history when clicked on title', async () => {
  //   const fixture: ComponentFixture<TabBreadcrumbsComponent> = TestBed.createComponent(TabBreadcrumbsComponent);
  //   const component: TabBreadcrumbsComponent = fixture.componentInstance;

  //   tabServiceSpy['activeTabIndex'] = 0;
  //   tabServiceSpy['openTabs'] = [
  //     [
  //       new Tab({ title: 'Home', url: '/home' }),
  //       new Tab({ title: 'Test 1', url: '/test1' }),
  //       new Tab({ title: 'Test 2', url: '/test2' }),
  //     ]
  //   ];

  //   fixture.detectChanges();
  //   await fixture.whenStable();

  //   const titlesDebug: DebugElement[] = fixture.debugElement.queryAll(By.css('a'));
  //   expect(titlesDebug).toBeTruthy();
  //   expect(titlesDebug.length).toBe(component['tabHistory'].length);

  //   const homeAnchor: HTMLAnchorElement = titlesDebug[0].nativeElement;
  //   homeAnchor.dispatchEvent(new Event('click'));

  //   expect(tabServiceSpy.navigateCurrentTabBack).toHaveBeenCalledWith(tabServiceSpy['openTabs'][0][0]);
  // });
});