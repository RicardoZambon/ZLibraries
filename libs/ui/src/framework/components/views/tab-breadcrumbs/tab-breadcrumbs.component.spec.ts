import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ITab, Tab } from '../../../models';
import { TabService } from '../../../services';
import { TabBreadcrumbsComponent } from './tab-breadcrumbs.component';

describe(TabBreadcrumbsComponent.name, () => {
  let tabServiceStub: { activeTabHistory: ITab[]; navigateCurrentTabBack: jest.Mock };
  let fixture: ComponentFixture<TabBreadcrumbsComponent>;
  let component: TabBreadcrumbsComponent;

  const history: ITab[] = [
    new Tab({ title: 'Home', url: '/home' }),
    new Tab({ title: 'Test 1', url: '/test1' }),
    new Tab({ title: 'Test 2', url: '/test2' }),
  ];

  beforeEach(async () => {
    tabServiceStub = { activeTabHistory: [], navigateCurrentTabBack: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [TabBreadcrumbsComponent, TranslateModule.forRoot()],
      providers: [{ provide: TabService, useValue: tabServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(TabBreadcrumbsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tab history', async () => {
    tabServiceStub.activeTabHistory = history;

    fixture.detectChanges();
    await fixture.whenStable();

    const anchors: DebugElement[] = fixture.debugElement.queryAll(By.css('a'));
    expect(anchors.length).toBe(history.length);

    anchors.forEach((anchor: DebugElement, index: number) => {
      expect((anchor.nativeElement as HTMLAnchorElement).textContent?.trim()).toBe(history[index].title);
    });
  });

  it('should render a spinner instead of a title while the title is loading', async () => {
    tabServiceStub.activeTabHistory = [new Tab({ url: '/loading' })];

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('a svg'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('a span'))).toBeNull();
  });

  it('should move back history when clicked on title', async () => {
    tabServiceStub.activeTabHistory = history;

    fixture.detectChanges();
    await fixture.whenStable();

    const anchors: DebugElement[] = fixture.debugElement.queryAll(By.css('a'));
    anchors[0].triggerEventHandler('click', new MouseEvent('click'));

    expect(tabServiceStub.navigateCurrentTabBack).toHaveBeenCalledWith(history[0]);
  });
});
