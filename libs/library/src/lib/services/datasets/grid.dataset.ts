import { EventEmitter, inject, Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { GuidHelper } from '../../helpers';
import { GridConfigs } from '../../models/configs/grid-configs';
import { GridConfigsProvider } from '../configs-providers/grid-configs.provider';
import { BaseDataset } from './base.dataset';

const KEY_FIELD: string = '_key';

@Injectable()
export abstract class GridDataset extends BaseDataset {
  //#region ViewChilds, Inputs, Outputs
  public filtersChanged = new EventEmitter<{ [key: string ] : string }>();
  public loadFinished: EventEmitter<boolean> = new EventEmitter<boolean>();
  public loadStarted: EventEmitter<void> = new EventEmitter();
  //#endregion

  //#region Variables
  public configs: GridConfigs;
  public loadedLastRow: boolean = false;
  
  protected configsProvider: GridConfigsProvider
  protected compareProperty: string = 'id';
  protected focusedRow: string | null = null;
  protected isLoading: boolean = false;
  protected recordBlock: number = 0;

  private _loadedKeys?: string[];
  private _loadedRows?: any[];
  private queryFilters?: { [key: string]: string; };
  //#endregion
  
  //#region Properties
  public get hasLoadedRows(): boolean {
    return !!this._loadedRows && this._loadedRows.length > 0;
  }

  public get keyProperty(): string {
    return this.compareProperty;
  }

  public get loadedKeys(): string[] | undefined {
    return this._loadedKeys;
  }

  public get loadedRows(): any[] | undefined {
    return this._loadedRows;
  }

  public override get parentEntityId(): any {
    return super.parentEntityId;
  }

  public override set parentEntityId(value: any) {
    super.parentEntityId = value;
    if (!!this.loadedRows) {
      this.refresh();
    }
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.configsProvider = inject(GridConfigsProvider);
    this.configs = JSON.parse(JSON.stringify(this.configsProvider.configs));
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public addNewRow(row: any): void {
    this.updateLoadedRows([row]);
  }

  public clearFocusedRow(): void {
    this.focusedRow = null;
  }

  public getRowData(key: string): any | null {
    if (this.hasLoadedRows) {
      const index: number = this._loadedKeys!.indexOf(key);
      return this.loadedRows![index];
    }
    return null;
  }

  public getRowID(key: string): any {
    const row: any = this.getRowData(key);
    
    return this.compareProperty.split('.')
      .reduce((row: any, property: string) => row[property], row);
  }

  public getRowInternalKey(row: any): string {
    return row[KEY_FIELD];
  }

  public hasRowWithID(id: any): boolean {
    if (!this.hasLoadedRows) {
      return false;
    }

    const loadedIDs: any[] =this.compareProperty.split('.')
      .reduce((loadedRows: any[], property: string) => loadedRows.map((row: any) => row[property]), this._loadedRows ?? [])
      .map((row: any) =>
        typeof id === 'string' ? `${row}`
        : typeof id === 'number' ? parseInt(`${row}`)
        : row
      );

    return loadedIDs.indexOf(id) >= 0;
  }
  
  public isKeyExists(key: string): boolean {
    return this.hasLoadedRows && this._loadedKeys!.some((x: string) => x === key);
  }

  public loadRows(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.loadStarted.emit();

    const parameters: any = {
      endRow: this.configsProvider.configs.recordBlockSize,
      filters: this.queryFilters,
      startRow: this.recordBlock,
    };

    this.getData(parameters)
      .pipe(take(1))
      .subscribe({
        next: (rows: any[]) => {
          if (rows?.length > 0) {
            this.updateLoadedRows(rows);
          }

          this.isLoading = false;
          this.loadFinished.emit(true);
        },
        error: (_: any) => {
          this.isLoading = false;
          this.loadFinished.emit(false);
        }
      });
  }

  public refresh(): void {
    if (this.focusedRow) {
      this.clearFocusedRow();
    }
    this.clearLoadedRows();
    this.loadRows();
  }

  public setFocusedRow(key: string): void {
    this.focusedRow = key;
  }

  public removeKeys(keys: string[]): void {
    if (!this.hasLoadedRows) {
      return;
    }

    keys.forEach((key: string) => {
      if (this.focusedRow === key) {
        this.clearFocusedRow();
      }

      const indexToRemove: number = this._loadedKeys!.indexOf(key);

      if (indexToRemove >= 0) {
        // Need to set again the array values to trigger the change detection.
        this._loadedKeys = this._loadedKeys!.filter((_, index) => index !== indexToRemove);
        this._loadedRows = this._loadedRows!.filter((_, index) => index !== indexToRemove);
      }
    });
  }

  public setFilters(filters?: { [key: string ] : string }): void {
    this.queryFilters = filters;
    this.filtersChanged.emit(filters);
    this.refresh();
  }
  
  public updateRow(key: string, newRowData: any): void {
    if (!this.hasLoadedRows) {
      return;
    }

    const index: number = this._loadedKeys!.indexOf(key);
    if (index >= 0) {
      // Need to set the KEY_FIELD value into the new data, to make sure this information is not lost.
      newRowData[KEY_FIELD] = key;

      this._loadedRows![index] = newRowData;

      // Need to update loaded rows to force displayed rows to refresh.
      this.updateLoadedRows([]);
    }
  }
  //#endregion

  //#region Private methods
  protected clearLoadedRows(): void {
    this._loadedRows = undefined;
    this._loadedKeys = undefined;
    this.recordBlock = 0;
    this.loadedLastRow = false;
  }

  protected updateLoadedRows(rows: any[]): void {
    // Assign individual key to each row.
    rows.forEach((row: any) => {
      row[KEY_FIELD] = GuidHelper.generateGUID();
    });

    this._loadedRows = [ ...this._loadedRows ?? [], ...rows];
    this._loadedKeys = [ ...this._loadedKeys ?? [], ...rows.map((row: any) => row[KEY_FIELD])];

    this.recordBlock += rows.length;
    if (rows.length < this.configsProvider.configs.recordBlockSize) {
      this.loadedLastRow = true;
    }
  }
  //#endregion

  //#region Abstract methods
  abstract getData(params?: any): Observable<any[]>;
  //#endregion
}