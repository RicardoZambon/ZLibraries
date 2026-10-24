import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
@Component({ template: '' })
export abstract class ViewBase implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  protected destroy$: Subject<boolean> = new Subject<boolean>();

  private _loading = false;
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
    this.destroy$.complete();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
