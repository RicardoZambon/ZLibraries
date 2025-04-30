import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NavigationConfigs } from '../../models/configs/navigation-configs';
import { INavigationItem } from '../../models/navigation-item';
import { NavigationDrawerService } from '../../services/navigation-drawer.service';
import { NavigationItemComponent } from '../navigation-item/navigation-item.component';

@Component({
  selector: 'lib-navigation-drawer',
  templateUrl: './navigation-drawer.component.html',
  styleUrls: ['./navigation-drawer.component.scss'],
  imports: [
    CommonModule,
    NgClass,
    NgFor,
    NgIf,
    NavigationItemComponent,
  ]
})
export class NavigationDrawerComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public set configs(value: Partial<NavigationConfigs>) {
    this._configs = Object.assign(this._configs, value);
  }
  @Input() public set items(value: INavigationItem[]) {
    this.navigationDrawerService.update(value);
  }
  @Input() public set menusEndpoint(value: string) {
    this.navigationDrawerService.menusEndpoint = value;
  }
  @Input() profileImage?: string;
  @Input() profileName?: string;
  @Input() profileTitle?: string;
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  private bodyMouseDown(event: MouseEvent): void {
    if (this.navigationDrawerService.expand) {
      const target = event.target as HTMLElement;
      this.clickedOutside = (event.button === 0 && !target.closest('.navigation-container')) ?? false;
    }
  }

  @HostListener('body:mouseup', ['$event'])
  private bodyMouseUp(event: MouseEvent): void {
    if (this.navigationDrawerService.expand && this.clickedOutside) {
      this.navigationDrawerService.expand = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  private documentKeyDown(event: KeyboardEvent): void {
    event = event || window.event;
    
    var isEscape = false
    if ('key' in event) {
      isEscape = (event.key === 'Escape' || event.key === 'Esc')
    } else {
      isEscape = ((<KeyboardEvent>event).keyCode === 27)
    }

    if (isEscape && this.navigationDrawerService.expand) {
      this.navigationDrawerService.expand = false;
    }
  }
  //#endregion

  //#region Variables
  private _configs: Partial<NavigationConfigs>;
  private clickedOutside = false;
  //#endregion

  //#region Properties
  public get collapsed(): boolean {
    return this.navigationDrawerService.collapsed;
  }
  public get configs(): Partial<NavigationConfigs> {
    return this._configs;
  }
  public get expand(): boolean {
    return this.navigationDrawerService.expand;
  }
  public get items(): INavigationItem[] {
    return this.navigationDrawerService.items;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private navigationDrawerService: NavigationDrawerService) {
    this._configs = {
      collapsedClassName: '-ml-[70px] md:ml-0 w-[70px]',
      expandedClassName: 'ml-0 md:w-[220px]',
      expandClassName: '!w-[220px]',
      itemClassName: 'h-11',
      loadingText: 'Loading'
    };
  }

  ngOnInit(): void {
    this.navigationDrawerService.load();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public collapse(): void {
    this.navigationDrawerService.collapsed = !this.navigationDrawerService.collapsed;
    this.navigationDrawerService.expand = false;
  }
  //#endregion

  //#region Private methods
  //#endregion
}