import { DataGridConfigs } from '@library';

export class DataGridDefaultConfigs implements DataGridConfigs {
  loadingDisplayText: string = 'Grid-Loading';
  messageOnEmpty:string = 'Grid-Message-Empty';
  multiSelect: boolean = false;
  recordBlockSize: number = 100;
  rowHeight: number = 35;
  rowsToDisplay: number = 6;
}