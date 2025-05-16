export class SidebarMenu {
  public childCount: number = 0;
  public children: SidebarMenu[] = [];
  public height?: number;
  public icon?: string;
  public id: number = 0;
  public label: string = '';
  public isSelected: boolean = false;
  public parent: SidebarMenu | null = null;
  public url?: string;

  constructor(options: Partial<SidebarMenu> = {}) {
    Object.assign(this, options);
  }
}