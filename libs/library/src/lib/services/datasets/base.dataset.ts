import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DataProviderService } from '../data-providers';

@Injectable()
export abstract class BaseDataset implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected dataProvider: DataProviderService<any> | null;
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  
  // TODO: Remove.
  private _parentEntityId?: any;
  //#endregion

  //#region Properties
  // TODO: Remove.
  public get parentEntityId(): any {
    return this._parentEntityId;
  }
  public set parentEntityId(value: any) {
    this._parentEntityId = value;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor() {
    this.dataProvider = inject(DataProviderService, { optional: true });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}