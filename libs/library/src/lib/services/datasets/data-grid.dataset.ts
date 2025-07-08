import { EventEmitter, Injectable } from '@angular/core';
import { DataGridConfigs } from '../../models/configs/data-grid-configs';
import { IGridColumn } from '../../models/grid-column';
import { GridDataset } from './grid.dataset';

@Injectable()
export abstract class DataGridDataset extends GridDataset {
  //#region ViewChilds, Inputs, Outputs
  public selectedRowsChanged: EventEmitter<{ [id: string]: { rowData: any; selected: boolean }}> = new EventEmitter<{ [id: string]: { rowData: any; selected: boolean }}>();
  //#endregion

  //#region Variables
  public columns!: IGridColumn[];
  public override configs: DataGridConfigs;
  public selectedRowKeys: string[] = [];
  //#endregion

  //#region Properties
  public get columnsSize(): string {
    const sizes: string[] = [];

    if (this.configs.multiSelect) {
      sizes.push(this.configs.multiSelectSize ?? 'minmax(1.5rem,min-content)');
    }

    sizes.push(...this.columns.map((col: IGridColumn) => col.size ?? 'minmax(0,1fr)'));

    return sizes.join(' ');
  }

  public get hasSelectedRows(): boolean {
    return this.selectedRowKeys.length > 0;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
      super();

      this.configs = JSON.parse(JSON.stringify(this.configsProvider.configs));
    }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public clearSelection(): void {
    if (!this.hasLoadedRows || !this.hasSelectedRows) {
      return;
    }

    const selectedKeys: string[] = this.selectedRowKeys;

    this.selectedRowKeys = [];
    this.clearFocusedRow();
    this.selectedRowsChanged.emit(selectedKeys.reduce((keys: { [id: string]: { rowData: any; selected: boolean } }, key: string) => {
      keys[key] = {
        rowData: this.getRowData(key),
        selected: false
      };
      return keys;
    }, {}));
  }

  public deselectRow(key: string): void {
    if (!this.hasLoadedRows || !this.isKeySelected(key)) {
      return;
    }

    this.removeSelectedRow(key);

    this.selectedRowsChanged.emit({
      [key]: {
        rowData: this.getRowData(key),
        selected: false,
      }
    });
  }

  public deselectRowID(id: any): void {
    if (!this.hasLoadedRows) {
      return;
    }

    const index: number = this.loadedKeys!.map((key: string) => this.getRowID(key))
      .indexOf(id);

    const key: string = this.loadedKeys![index];
    this.deselectRow(key);
  }

  public getSelectedRowsData(): any[] {
    if (!this.hasLoadedRows || !this.hasSelectedRows) {
      return [];
    }

    return this.selectedRowKeys.map((key: string) => this.loadedKeys!.indexOf(key))
      .filter((index: number) => index >= 0)
      .map((index: number) => this.loadedRows![index]);
  }

  public isKeySelected(key: any): boolean {
    return this.selectedRowKeys.indexOf(key) >= 0;
  }

  public override refresh(): void {
    if (this.hasSelectedRows) {
      this.clearSelection();
    }
    super.refresh();
  }

  public override removeKeys(keys: string[]): void {
    if (!this.hasLoadedRows) {
      return;
    }

    if (this.hasSelectedRows) {
      keys.filter((key: string) => this.isKeySelected(key))
        .forEach((key: string) => {
          this.removeSelectedRow(key);
        });
    }

    super.removeKeys(keys);
  }

  public selectRow(key: string): void {
    if (!this.hasLoadedRows) {
      return;
    }

    if (!this.configs.multiSelect){
      if (this.isKeySelected(key)) {
        return;
      }
      // Clear current selected row.
      this.removeSelectedRow(this.selectedRowKeys[0]);
    }

    if (!this.isKeySelected(key)) {
      this.selectedRowKeys.push(key);
      this.selectedRowsChanged.emit({
        [key]: {
          rowData: this.getRowData(key),
          selected: true,
        }
      });
    }
  }

  public selectRowID(id: any): void {
    if (!this.hasLoadedRows) {
      return;
    }

    if (this.hasRowWithID(id)) {
      const rowIndex: number = this.loadedRows!.findIndex((row: any) => row[this.compareProperty] === id);
      
      if (rowIndex < 0) {
        return;
      }

      const key: string | undefined = this.loadedKeys![rowIndex];
      if (!!key) {
        this.selectRow(key);
      }
    }
  }

  public selectRows(keys: string[]): void {
    if (!this.hasLoadedRows || !this.configs.multiSelect) {
      return;
    }

    // Filter only the keys that are not selected yet.
    const keysNotSelected: string[] = keys.filter((key: string) => !this.isKeySelected(key));
    
    if (keysNotSelected.length > 0) {
      this.selectedRowKeys.push(...keysNotSelected);
      this.selectedRowsChanged.emit(keys.reduce((keys: { [id: string]: { rowData: any; selected: boolean } }, key: string) => {
        keys[key] = {
          rowData: this.getRowData(key),
          selected: true,
        };
        return keys;
      }, {}));
    }
  }

  public override setFocusedRow(key: any): void {
    super.setFocusedRow(key);

    if (!this.configs.multiSelect) {
      this.selectRow(key);
    } else if (this.configs.selectOnClick ?? true) {
      if (this.isKeySelected(key)) {
        this.deselectRow(key);
      } else {
        this.selectRow(key);
      }
    }
  }
  //#endregion

  //#region Private methods
  protected removeSelectedRow(key: string): void {
    const index: number = this.selectedRowKeys.indexOf(key);
    if (index >= 0) {
      this.selectedRowKeys.splice(index, 1);
    }
  }
  //#endregion
}