import { EventEmitter, Injectable } from '@angular/core';

import { INavigationItem } from '../models/navigation-item';
import { MenuEntriesService } from './menus.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationDrawerService {
  //#region ViewChilds, Inputs, Outputs
  public selected = new EventEmitter<INavigationItem>();
  public updatedChildren = new EventEmitter<INavigationItem>();
  //#endregion

  //#region Variables
  public collapsed: boolean = false;
  public expand: boolean = false;
  public menusEndpoint?: string | undefined;
  
  private _items: INavigationItem[] = [];
  //#endregion

  //#region Properties
  public get items(): INavigationItem[] {
    return this._items;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private menuEntriesService: MenuEntriesService) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public deselect(item: INavigationItem): void {
    if (item.children && item.children.some(subItem => subItem.selected)) {
      item.children
      .filter(subItem => subItem.selected)
      .forEach(subItem => {
        this.deselect(subItem);
      });
      this.updatedChildren.emit(item);
    }
    item.selected = false;
  }
  public load(parentMenu: INavigationItem | null = null): void {
    if (parentMenu) {
      this.updatedChildren.emit(parentMenu);
    }
    
    if (this.menusEndpoint) {
      this.menuEntriesService.list(this.menusEndpoint, parentMenu?.id ?? null)
      .subscribe(x => {
        if (parentMenu === null) {
          this._items = x;
        }
        else {
          parentMenu.children = x;
          this.updatedChildren.emit(parentMenu);
        }
      });
    }
  }
  public select(selected: INavigationItem): void {
    if (selected.childCount > 0 && (selected.children?.length ?? 0) == 0) {
      this.load(selected);
    }

    this._items.forEach(item => {
      this.internalSelect(null, item, selected);

      if (!item.selected && !item.children?.some(subItem => subItem.selected)) {
        this.deselect(item);
      }
    });
  }
  public update(items: INavigationItem[]): void {
    this._items = items;
  }
  //#endregion

  //#region Private methods
  private internalSelect(parent: INavigationItem | null, item: INavigationItem, selected: INavigationItem): boolean {
    const previouslySelected = item.selected;
    
    item.selected = item === selected;

    if ((item.children?.length ?? 0) > 0 && (item.selected !== previouslySelected || (item.selected && previouslySelected))) {
      this.updatedChildren.emit(item);
    }

    if (item.selected && previouslySelected && (!this.collapsed || this.expand) && !!item.children) {
      this.deselect(item);
      return previouslySelected;
    }

    if (item.selected) {
      if (!!item.url) {
        this.selected.emit(item);
        this.expand = false;
      }
      else if (parent === null && item.selected) {
        this.expand = true;
      }
    }
    else {
      if (item.children) {
        item.selected = item.children
        .map(subItem => this.internalSelect(item, subItem, selected))
        .some(selected => selected);
      }
    }

    return item.selected;
  }
  //#endregion
}