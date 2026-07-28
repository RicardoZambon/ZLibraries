import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ISidebarProfile, SidebarMenu } from '../../models';
import { SidebarService } from '../../services';
import { SidebarItemComponent } from './sidebar-item.component';

class MockSidebarService extends SidebarService {
  public override isCollapsed: boolean = false;
  public override isActive: boolean = false;
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ url }));
  }
  public getUserProfile(): ISidebarProfile | undefined {
    return undefined;
  }
  protected loadMenus(_parent: SidebarMenu | null): Observable<SidebarMenu[]> {
    return of([]);
  }
}

function leafMenu(): SidebarMenu {
  return new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard' });
}

function parentMenu(): SidebarMenu {
  return new SidebarMenu({ id: 2, label: 'Catalogs', icon: 'fa-layer-group', childCount: 2 });
}

describe(SidebarItemComponent.name, () => {
  let service: MockSidebarService;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  function createComponent(menu: SidebarMenu): ComponentFixture<SidebarItemComponent> {
    const fixture: ComponentFixture<SidebarItemComponent> = TestBed.createComponent(SidebarItemComponent);
    fixture.componentInstance.menu = menu;
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarItemComponent, OverlayModule, TranslateModule.forRoot()],
      providers: [{ provide: SidebarService, useClass: MockSidebarService }],
    }).compileComponents();

    service = TestBed.inject(SidebarService) as MockSidebarService;
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    overlayContainer?.ngOnDestroy();
  });

  it('should create', () => {
    expect(createComponent(leafMenu()).componentInstance).toBeTruthy();
  });

  it('reflects selection to the state class for the pill highlight', () => {
    const fixture = createComponent(leafMenu());
    fixture.componentInstance.menu.isSelected = true;
    service.selectionChanged.emit(fixture.componentInstance.menu);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList.contains('selected')).toBe(true);
    expect(host.querySelector('li > div')).toBeTruthy();
  });

  it('renders expanded-style (flyout host class) when displayMode is flyout while collapsed', () => {
    service.isCollapsed = true;
    const fixture = TestBed.createComponent(SidebarItemComponent);
    fixture.componentInstance.menu = leafMenu();
    fixture.componentInstance.displayMode = 'flyout';
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('flyout')).toBe(true);
  });
});
