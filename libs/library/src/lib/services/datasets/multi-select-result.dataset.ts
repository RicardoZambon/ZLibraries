import { EventEmitter, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { IMultiSelectorChanges } from '../../models/multi-selector-changes';
import { GridDataset } from './grid.dataset';

@Injectable()
export abstract class MultiSelectResultDataset extends GridDataset {
  //#region ViewChilds, Inputs, Outputs
  public savedChanges: EventEmitter<void> = new EventEmitter();
  //#endregion

  //#region Variables
  private _idsToAdd: any[] = [];
  private _idsToRemove: any[] = [];
  private addedRowData: any[] = [];
  public displayedIDs: any[] = [];
  public displayedRows: any[] = [];
  //#endregion
  
  //#region Properties
  public get idsToAdd(): any[] {
    return this._idsToAdd;
  }

  public get idsToRemove(): any[] {
    return this._idsToRemove;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public override refresh(): void {
    this.clearSelection();
    super.refresh();
  }

  public saveChanges(): Observable<any> {
    const changes: IMultiSelectorChanges = {
      idsToAdd: this.idsToAdd,
      idsToRemove: this.idsToRemove,
    };

    return this.saveData(changes)
      .pipe(
        tap(() => {
          this.savedChanges.emit();
          this.clearSelection();
          this.clearLoadedRows();
        })
      );
  }

  public setIDToAdd(idToAdd: any, rowData: any): void {
    const index: number = this._idsToRemove.indexOf(idToAdd);
    if (index >= 0) {
      this._idsToRemove.splice(index, 1);
    } else if (!this.isExistingID(idToAdd)) {
      this._idsToAdd.push(idToAdd);
      this.addedRowData.push(rowData);
    }
    this.updateDisplayedRows();
  }

  public setIDToRemove(idToRemove: any): void {
    const index: number = this._idsToAdd.indexOf(idToRemove);
    if (index >= 0) {
      this._idsToAdd.splice(index, 1);
      this.addedRowData.splice(index, 1);
    } else if (this.isExistingID(idToRemove)) {
      this._idsToRemove.push(idToRemove);
    }
    this.updateDisplayedRows();
  }

  protected override updateLoadedRows(rows: any[]): void {
    super.updateLoadedRows(rows);
    this.updateDisplayedRows();
  }
  //#endregion

  //#region Private methods
  private clearSelection(): void {
    this._idsToAdd = [];
    this._idsToRemove = [];
    this.addedRowData = [];

    this.updateDisplayedRows();
  }

  private isExistingID(id: any): boolean {
    return (this.loadedKeys ?? [])
      .map((key: string) => this.getRowID(key))
      .indexOf(id) >= 0;
  }

  private updateDisplayedRows() {
    const loadedKeys: string[] = (this.loadedKeys ?? [])
      .filter((key: string) => this.idsToRemove.indexOf(this.getRowID(key)) < 0);
    
    this.displayedIDs = loadedKeys.map((key: string) => this.getRowID(key));
    this.displayedIDs.push(...this._idsToAdd);

    this.displayedRows = loadedKeys.map((key: string) => this.getRowData(key));
    this.displayedRows.push(...this.addedRowData);
  }
  //#endregion

  //#region Abstract methods
  protected abstract saveData(changedIds: IMultiSelectorChanges): Observable<any>;
  //#endregion
}