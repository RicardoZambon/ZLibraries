import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({ template: '' })
export abstract class BaseComponent implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  protected destroy$: Subject<boolean> = new Subject<boolean>();
  //#endregion

  //#region Properties
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