export interface IMultiEditorChanges {
  changed: { [key: string]: string };
  removed: string[];
}