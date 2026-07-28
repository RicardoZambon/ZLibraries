import { FlexibleConnectedPositionStrategy, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { delay, filter, takeUntil } from 'rxjs';
import { SidebarMenu } from '../../models';
import { SidebarService } from '../../services';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-sidebar-item',
  templateUrl: './sidebar-item.component.html',
  styleUrls: ['./sidebar-item.component.scss'],
  imports: [
    NgFor,
    NgIf,
    NgStyle,
    TranslatePipe,
  ],
  host: {
    '[class.active]': 'isActive',
    '[class.expanded]': '!isCollapsed',
    '[class.first-level]': 'level === 0',
    '[class.flyout]': "displayMode === 'flyout'",
    '[class.selected]': 'isSelected',
  }
})
export class SidebarItemComponent extends BaseComponent implements OnInit, AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('menuContainer') private menuContainer!: ElementRef<HTMLAnchorElement>;
  @ViewChild('flyoutTemplate', { read: TemplateRef }) private flyoutTemplate!: TemplateRef<unknown>;

  @Input() public menu!: SidebarMenu;
  @Input() public level: number = 0;
  @Input() public displayMode: 'rail' | 'flyout' = 'rail';
  //#endregion

  //#region Variables
  protected hasFailed: boolean = false;
  protected isFlyoutOpen: boolean = false;
  protected isLoading: boolean = false;
  protected isSelected: boolean = false;

  private _childHeight: number = 0;
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private flyoutCloseTimer?: ReturnType<typeof setTimeout>;
  private overlay: Overlay = inject(Overlay);
  private overlayRef?: OverlayRef;
  private positionBuilder: OverlayPositionBuilder = inject(OverlayPositionBuilder);
  private sidebarService: SidebarService = inject(SidebarService);
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  //#endregion

  //#region Properties
  public get childHeight(): number {
    return this._childHeight;
  }

  protected get areChildrenLoaded(): boolean {
    return this.isParent && (this.menu.children?.length ?? 0) > 0;
  }

  protected get isActive(): boolean {
    return this.sidebarService.isActive;
  }

  protected get isCollapsed(): boolean {
    return this.sidebarService.isCollapsed;
  }

  protected get isParent(): boolean {
    return this.menu.childCount > 0;
  }

  protected get canFlyout(): boolean {
    return this.displayMode === 'rail' && this.isParent && this.isCollapsed && !this.isActive;
  }

  protected get hasIcon(): boolean {
    return !!this.menu.icon && this.menu.icon.length > 0;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor() {
    super();
  }

  public ngAfterViewInit(): void {
    if (!!this.menu && !!this.menu.parent) {
      this.menu.height = this.menuContainer?.nativeElement?.offsetHeight ?? 0;
      this.sidebarService.childrenInitialized.emit(this.menu.parent);
    }
  }

  public ngOnInit(): void {
    if (this.isParent) {
      this.sidebarService.childrenFailed
        .pipe(
          takeUntil(this.destroy$),
          filter((menu: SidebarMenu) => menu.id === this.menu.id),
          delay(1000),
        )
        .subscribe((_menu: SidebarMenu) => {
          this.hasFailed = true;
          this.isLoading = false;
          this.isSelected = false;
          this.menu.isSelected = false;

          this.changeDetectorRef.detectChanges();
        });

      this.sidebarService.childrenLoading
        .pipe(
          takeUntil(this.destroy$),
          filter((menu: SidebarMenu) => menu.id === this.menu.id)
        )
        .subscribe((_menu: SidebarMenu) => {
          this.hasFailed = false;
          this.isLoading = true;
        });

      this.sidebarService.childrenInitialized
        .pipe(
          takeUntil(this.destroy$),
          filter((menu: SidebarMenu) => menu.id === this.menu.id && this.menu.children.every((child: SidebarMenu) => (child.height ?? 0) > 0))
        )
        .subscribe((_menu: SidebarMenu) => {
          this.isLoading = false;
          this.hasFailed = false;
          this.updateSubMenuHeight();

          if (!!this.menu.parent) {
            this.sidebarService.childrenInitialized.emit(this.menu.parent);
          }

          this.changeDetectorRef.detectChanges();
        });
    }

    this.sidebarService.selectionChanged
      .pipe(
        takeUntil(this.destroy$),
        filter((menu: SidebarMenu) => menu.id === this.menu.id)
      )
      .subscribe((menu: SidebarMenu) => {
        this.isSelected = menu.isSelected;
        this.updateSubMenuHeight();
      });

    this.sidebarService.menuUrlSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.closeFlyout());
  }

  public override ngOnDestroy(): void {
    this.closeFlyout();
    super.ngOnDestroy();
  }
  //#endregion

  //#region Event handlers
  protected onSelectItem(): void {
    if (this.canFlyout) {
      if (this.isFlyoutOpen) {
        this.closeFlyout();
      } else {
        this.openFlyout();
      }
      return;
    }

    if (this.displayMode !== 'flyout' && this.sidebarService.shouldActivate) {
      this.sidebarService.isActive = true;
    }

    this.sidebarService.select(this.menu);
  }

  protected onAnchorEnter(): void {
    if (!this.canFlyout) {
      return;
    }
    this.clearFlyoutCloseTimer();
    this.openFlyout();
  }

  protected onAnchorLeave(): void {
    this.scheduleFlyoutClose();
  }

  protected onFlyoutEnter(): void {
    this.clearFlyoutCloseTimer();
  }

  protected onFlyoutLeave(): void {
    this.scheduleFlyoutClose();
  }

  @HostListener('document:keydown.escape')
  protected onDocumentEscape(): void {
    if (this.isFlyoutOpen) {
      this.closeFlyout();
    }
  }

  @HostListener('document:mousedown', ['$event'])
  protected onDocumentMouseDown(event: MouseEvent): void {
    if (!this.isFlyoutOpen) {
      return;
    }
    const target: HTMLElement = event.target as HTMLElement;
    const inAnchor: boolean = this.menuContainer?.nativeElement?.contains(target) ?? false;
    const inOverlay: boolean = this.overlayRef?.overlayElement?.contains(target) ?? false;
    if (!inAnchor && !inOverlay) {
      this.closeFlyout();
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  protected trackByFn(_index: number, item: SidebarMenu): number {
    return item.id;
  }

  private getChildHeight(menu: SidebarMenu): number {
    if (menu.isSelected) {
      return menu.children.reduce((height: number, childMenu: SidebarMenu) => height + (childMenu.height ?? 0) + this.getChildHeight(childMenu), 0);
    }
    return 0;
  }

  private updateSubMenuHeight(): void {
    this._childHeight = this.getChildHeight(this.menu);
  }

  private openFlyout(): void {
    if (!this.canFlyout || this.isFlyoutOpen) {
      return;
    }

    if ((this.menu.children?.length ?? 0) === 0) {
      this.sidebarService.loadChildren(this.menu);
    }

    const positionStrategy: FlexibleConnectedPositionStrategy = this.positionBuilder
      .flexibleConnectedTo(this.menuContainer)
      .withPositions([
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
        { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
        { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef.attach(new TemplatePortal(this.flyoutTemplate, this.viewContainerRef));
    this.isFlyoutOpen = true;
  }

  private closeFlyout(): void {
    this.clearFlyoutCloseTimer();
    this.isFlyoutOpen = false;
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  private scheduleFlyoutClose(): void {
    this.clearFlyoutCloseTimer();
    this.flyoutCloseTimer = setTimeout(() => this.closeFlyout(), 150);
  }

  private clearFlyoutCloseTimer(): void {
    if (this.flyoutCloseTimer) {
      clearTimeout(this.flyoutCloseTimer);
      this.flyoutCloseTimer = undefined;
    }
  }
  //#endregion
}