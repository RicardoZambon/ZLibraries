import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({ template: '' })
export abstract class ViewBase implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private _loading: boolean = false;
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  //#endregion

  //#region Properties
  public get loading(): boolean {
    return this._loading;
  }
  public set loading(value: boolean) {
    this._loading = value;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
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