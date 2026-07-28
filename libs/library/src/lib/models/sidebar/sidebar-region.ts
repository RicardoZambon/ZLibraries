import { SidebarMenu } from './sidebar-menu';

/** A named group of top-level sidebar menu items, rendered under a region header. */
export interface SidebarRegion {
  items: SidebarMenu[];
  name?: string;
}
