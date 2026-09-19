import { SidebarMenuOpenMode } from './sidebar-menu-open-mode';

export class SidebarMenu {
  public childCount = 0;
  public children: SidebarMenu[] = [];
  public height?: number;
  public icon?: string;
  public id = 0;
  public label = '';
  public isSelected = false;
  /**
   * How {@link url} is opened. An absent value means {@link SidebarMenuOpenMode.Internal}.
   *
   * Left optional and without an initializer on purpose: the constructor is an `Object.assign`,
   * which would overwrite a default with the `null` a nullable backend column serializes to.
   * Read it through `toSidebarMenuOpenMode(menu.openMode)` instead of comparing it directly.
   */
  public openMode?: SidebarMenuOpenMode;
  public parent: SidebarMenu | null = null;
  public region?: string;
  public url?: string;

  constructor(options: Partial<SidebarMenu> = {}) {
    Object.assign(this, options);
  }
}
