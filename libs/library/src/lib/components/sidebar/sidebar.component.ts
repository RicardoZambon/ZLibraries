import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, HostListener, Inject, OnInit } from '@angular/core';
import { take, takeUntil } from 'rxjs';
import { ISidebarProfile, SIDEBAR_CONFIGS, SidebarConfigs, SidebarMenu } from '../../models';
import { SidebarService } from '../../services';
import { BaseComponent } from '../base.component';
import { SidebarItemComponent } from '../sidebar-item/sidebar-item.component';

@Component({
  selector: 'lib-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    SidebarItemComponent,
  ],
  host: {
    '[class.active]': 'isActive',
    '[class.expanded]': '!isCollapsed',
  }
})
export class SidebarComponent extends BaseComponent implements AfterViewInit, OnInit {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  private onBodyMouseDown(event: MouseEvent): void {
    if (this.isActive && event.target) {
      const target: HTMLElement = <HTMLElement>event.target;
      this.wasClickedOutside = (event.button === 0 && !target.closest('lib-sidebar')) ?? false;
    }
  }

  @HostListener('body:mouseup', ['$event'])
  private onBodyMouseUp(_event: MouseEvent): void {
    if (this.wasClickedOutside) {
      this.wasClickedOutside = false;
      this.deactivate();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  private onDocumentKeyDown(event: KeyboardEvent): void {
    event = event || window.event;
    
    let isEscapeKey: boolean = false;
    if ('key' in event) {
      isEscapeKey = (event.key === 'Escape' || event.key === 'Esc')
    } else {
      isEscapeKey = ((<KeyboardEvent>event).keyCode === 27)
    }

    if (isEscapeKey) {
      this.deactivate();
    }
  }

  @HostListener('window:resize', ['$event'])
  private onResize(_event: Event): void {
    this.updateShouldActivate();
  }
  //#endregion

  //#region Variables
  protected configErrorText: string;
  protected configLogoCollapsedPath?: string;
  protected configLogoExpandedPath?: string;
  protected configLoadingText: string;
  protected hasFailed: boolean = false;
  protected menus: SidebarMenu[] = [];
  protected profile?: ISidebarProfile;
  private wasClickedOutside: boolean = false;
  //#endregion

  //#region Properties
  protected get hasProfileImage(): boolean {
    return this.isProfileLoaded && (this.profile!.image?.length ?? 0) > 0  
  }

  protected get isActive(): boolean {
    return this.sidebarService.isActive;
  }

  protected get isCollapsed(): boolean {
    return this.sidebarService.isCollapsed;
  }

  protected get isLoading(): boolean {
    return this.menus.length === 0;
  }

  protected get isProfileLoaded(): boolean {
    return !!this.profile;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(
    @Inject(SIDEBAR_CONFIGS) sidebarConfigs: SidebarConfigs,
    private sidebarService: SidebarService,
  ) {
    super();

    this.configErrorText = sidebarConfigs.errorText;
    this.configLoadingText = sidebarConfigs.loadingText;
    this.configLogoCollapsedPath = sidebarConfigs.logoCollapsedPath;
    this.configLogoExpandedPath = sidebarConfigs.logoExpandedPath;
  }

  public ngAfterViewInit(): void {
    this.updateShouldActivate();
  }

  public ngOnInit(): void {
    this.sidebarService.menuUrlSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe((_menu: SidebarMenu) => this.deactivate());

    this.sidebarService.loadRoot()
      .pipe(take(1))
      .subscribe({
        next: (menus: SidebarMenu[]) => this.menus = menus,
        error: () => this.hasFailed = true
      });

    this.profile = this.sidebarService.getUserProfile();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public collapse(): void {
    this.sidebarService.isCollapsed = !this.sidebarService.isCollapsed;
    this.sidebarService.isActive = false;

    if (this.sidebarService.isCollapsed) {
      this.sidebarService.deselectAll();
    }

    this.updateShouldActivate();
  }
  //#endregion

  //#region Private methods
  private deactivate(): void {
    if (this.sidebarService.isActive) {
      this.sidebarService.isActive = false;
      this.sidebarService.deselectAll();
    }
  }

  protected trackByFn(_index: number, item: SidebarMenu): number {
    return item.id;
  }

  private updateShouldActivate(): void {
    this.sidebarService.shouldActivate =
      (window.innerWidth <= 767 && !this.sidebarService.isCollapsed)
      || this.sidebarService.isCollapsed;
  }
  //#endregion
}