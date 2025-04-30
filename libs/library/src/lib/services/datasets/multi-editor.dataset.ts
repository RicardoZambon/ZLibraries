import { EventEmitter, inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { IBatchUpdate } from '../../models/batch-update';
import { IMultiEditorChanges } from '../../models/multi-editor-changes';
import { BaseDataset } from './base.dataset';
import { DataGridDataset } from './data-grid.dataset';

@Injectable()
export abstract class MultiEditorDataset extends BaseDataset {
  //#region ViewChilds, Inputs, Outputs
  public savedChanges: EventEmitter<void> = new EventEmitter();
  //#endregion

  //#region Variables
  protected readonly dataGridDataset: DataGridDataset;
  private fakeIDsGenerated: any[] = [];
  private modifiedValues: IMultiEditorChanges = {
    changed: {},
    removed: [],
  };
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.dataGridDataset = inject(DataGridDataset);
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public clearChangedValues(): void {
    this.fakeIDsGenerated = [];

    this.modifiedValues = {
      changed: {},
      removed: [],
    };
  }

  public removeValue(key: string) : void {
    if (this.modifiedValues.changed[key]) {
      delete this.modifiedValues.changed[key]; 
    }

    const id: any = this.dataGridDataset.getRowID(key);
    this.dataGridDataset.removeKeys([key]);

    if (!id) {
      return;
    }

    if (this.fakeIDsGenerated.indexOf(id) < 0) {
      this.modifiedValues.removed.push(id);
    } else {
      this.fakeIDsGenerated.splice(this.fakeIDsGenerated.indexOf(id), 1);
    }
  }

  public saveChanges(): Observable<any> {
    const batchUpdate: IBatchUpdate<any,any> = {
      entitiesToInsertOrUpdate: Object.entries(this.modifiedValues.changed).map(([_, v]: [string, string]) => v),
      entitiesToDelete: this.modifiedValues.removed,
    };

    return this.saveData(batchUpdate)
      .pipe(tap(() => this.savedChanges.emit()));
  }

  public storeFakeIDGenerated(id: any): void {
    if (this.fakeIDsGenerated.indexOf(id) >= 0) {
      return;
    }

    this.fakeIDsGenerated.push(id);
  }

  public updateValues(key: string, newRowData: any): void {
    this.modifiedValues.changed[key] = newRowData;

    this.dataGridDataset.updateRow(key, newRowData);
  }
  //#endregion

  //#region Private methods
  //#endregion

  //#region Abstract methods
  public abstract newData(id: any): any;

  public abstract saveData(batchUpdate: IBatchUpdate<any,any>): Observable<any>;
  //#endregion
}