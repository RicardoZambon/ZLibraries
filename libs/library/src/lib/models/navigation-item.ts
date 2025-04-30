export interface INavigationItem {
  childCount: number;
  children: INavigationItem[] | null;
  height: number;
  icon: string;
  id: number;
  label: string;
  selected: boolean;
  url: string;
}