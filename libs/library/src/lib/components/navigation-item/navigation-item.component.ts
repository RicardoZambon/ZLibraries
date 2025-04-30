import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { NavigationConfigs } from '../../models/configs/navigation-configs';
import { INavigationItem } from '../../models/navigation-item';
import { NavigationDrawerService } from '../../services/navigation-drawer.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-navigation-item',
  templateUrl: './navigation-item.component.html',
  styleUrls: ['./navigation-item.component.scss'],
  imports: [
    NgClass,
    NgFor,
    NgIf,
    NgStyle,
    TranslatePipe,
  ]
})
export class NavigationItemComponent extends BaseComponent implements AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('linkContainer') private linkContainer!: ElementRef<HTMLAnchorElement>;

  @Input() public configs!: Partial<NavigationConfigs>;
  @Input() public item?: INavigationItem;
  @Input() public itemClassName: string = '';
  @Input() public level: number = 0;
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  private _childHeight: number = 0;
  //#endregion

  //#region Properties
  public get childHeight(): number {
    return this._childHeight;
  }

  public get collapsed(): boolean {
    return this.menuService.collapsed;
  }

  public get expanded(): boolean {
    return this.menuService.expand;
  }

  public get isFirstLevel(): boolean {
    return this.level === 0;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private menuService: NavigationDrawerService) {
    super();

    this.menuService.updatedChildren
      .pipe(takeUntil(this.destroy$))
      .subscribe((_: INavigationItem) => {
        this.updateSubMenuHeight();
      });
  }

  public ngAfterViewInit(): void {
    if (this.item) {
      this.item.height = this.linkContainer?.nativeElement?.offsetHeight ?? 0;
    }
  }
  //#endregion

  //#region Event handlers
  protected onSelectItem(): void {
    if (this.item) {
      this.menuService.select(this.item);
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  private getHeight(item: INavigationItem, level: number = 0): number {
    let height = item.height;
    if (item.selected && item.childCount > 0) {
      if (level === 0) {
        height = 0;
      }
      
      if (!item.children || item.children.length === 0) {
        height += item.height;
      } else {
        height += (item.children.reduce((sum, x) => sum + this.getHeight(x, level + 1), 0) ?? 0);
      }
    }
    return height;
  }
  
  private updateSubMenuHeight(): void {
    setTimeout(() => {
      if (this.item) {
        //We need the timeout to get the correct sub menu height due the menu animation of 150ms.
        this._childHeight = this.getHeight(this.item);
      }
    }, 10);
  }
  //#endregion
}