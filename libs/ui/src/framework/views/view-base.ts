import { Component, OnDestroy, signal, WritableSignal } from '@angular/core';
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

  // A signal rather than a field: a view's own template reads `loading` to show its spinner,
  // and every assignment here happens inside a subscription. The accessors below keep their
  // old shape, so a subclass reading or writing `this.loading` needs no change; a subclass
  // template is better off reading `loadingState()` directly.
  protected readonly loadingState: WritableSignal<boolean> = signal(false);
  //#endregion

  //#region Properties
  public get loading(): boolean {
    return this.loadingState();
  }
  public set loading(value: boolean) {
    this.loadingState.set(value);
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
