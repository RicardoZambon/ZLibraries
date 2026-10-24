import { NgStyle } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { delay, filter, takeUntil } from 'rxjs';
import { SIDEBAR_CONFIGS, SidebarConfigs, SidebarMenu, SidebarMenuOpenMode, toSidebarMenuOpenMode } from '../../models';
import { SidebarService } from '../../services';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-sidebar-item',
  templateUrl: './sidebar-item.component.html',
  styleUrls: ['./sidebar-item.component.scss'],
  imports: [NgStyle, TranslatePipe],
  host: {
    '[class.active]': 'isActive',
    '[class.expanded]': '!isCollapsed',
    '[class.first-level]': 'level === 0',
    '[class.last-child]': 'isLast',
    '[class.selected]': 'isSelected()',
  },
})
export class SidebarItemComponent extends BaseComponent implements OnInit, AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('menuContainer') private menuContainer!: ElementRef<HTMLAnchorElement>;

  @Input() public isLast = false;
  @Input() public level = 0;
  @Input() public menu!: SidebarMenu;
  //#endregion

  //#region Variables
  // Signals, not fields. Three of these are read from host bindings, which Angular evaluates in
  // the PARENT's pass -- so `changeDetectorRef.detectChanges()` on this component could never
  // refresh them, and writing them after that pass raised NG0100 instead. A signal write marks
  // this view and every ancestor, which is the only notification that reaches a host binding.
  protected readonly hasFailed: WritableSignal<boolean> = signal(false);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly isSelected: WritableSignal<boolean> = signal(false);

  private readonly _childHeight: WritableSignal<number> = signal(0);
  private sidebarConfigs: SidebarConfigs = inject(SIDEBAR_CONFIGS);
  private sidebarService: SidebarService = inject(SidebarService);
  //#endregion

  //#region Properties
  public get childHeight(): number {
    return this._childHeight();
  }

  protected get areChildrenLoaded(): boolean {
    return this.isParent && (this.menu.children?.length ?? 0) > 0;
  }

  protected get externalLinkText(): string {
    return this.sidebarConfigs.externalLinkText;
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

  protected get opensInNewBrowserTab(): boolean {
    return (
      (this.menu.url?.length ?? 0) > 0 &&
      toSidebarMenuOpenMode(this.menu.openMode) === SidebarMenuOpenMode.ExternalNewTab
    );
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
          this.hasFailed.set(true);
          this.isLoading.set(false);
          this.isSelected.set(false);
          this.menu.isSelected = false;
        });

      this.sidebarService.childrenLoading
        .pipe(
          takeUntil(this.destroy$),
          filter((menu: SidebarMenu) => menu.id === this.menu.id),
        )
        .subscribe((_menu: SidebarMenu) => {
          this.hasFailed.set(false);
          this.isLoading.set(true);
        });

      this.sidebarService.childrenInitialized
        .pipe(
          takeUntil(this.destroy$),
          filter(
            (menu: SidebarMenu) =>
              menu.id === this.menu.id && this.menu.children.every((child: SidebarMenu) => (child.height ?? 0) > 0),
          ),
        )
        .subscribe((_menu: SidebarMenu) => {
          this.isLoading.set(false);
          this.hasFailed.set(false);
          this.updateSubMenuHeight();

          if (this.menu.parent) {
            this.sidebarService.childrenInitialized.emit(this.menu.parent);
          }
        });
    }

    this.sidebarService.selectionChanged
      .pipe(
        takeUntil(this.destroy$),
        filter((menu: SidebarMenu) => menu.id === this.menu.id),
      )
      .subscribe((menu: SidebarMenu) => {
        this.isSelected.set(menu.isSelected);
        this.updateSubMenuHeight();
      });
  }
  //#endregion

  //#region Event handlers
  protected onSelectItem(): void {
    if (this.sidebarService.shouldActivate) {
      this.sidebarService.isActive = true;
    }

    this.sidebarService.select(this.menu);
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
      return menu.children.reduce(
        (height: number, childMenu: SidebarMenu) => height + (childMenu.height ?? 0) + this.getChildHeight(childMenu),
        0,
      );
    }
    return 0;
  }

  private updateSubMenuHeight(): void {
    this._childHeight.set(this.getChildHeight(this.menu));
  }
  //#endregion
}
