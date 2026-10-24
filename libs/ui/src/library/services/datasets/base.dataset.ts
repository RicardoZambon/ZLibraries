import { inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { DataProviderService } from '../data-providers';

@Injectable()
export abstract class BaseDataset implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  /**
   * Bumped by every write to dataset state, and read by every accessor below it.
   *
   * A dataset is rows, keys and selections mutated in place -- pushed, spliced, reassigned -- so a
   * signal holding the array could not see the change. This counter stands in for one: the read
   * inside each accessor is what makes a template using it re-render. It is a bridge for mutable
   * collections, not a pattern to copy into a component; there the state itself is the signal.
   * See docs/guides/reactivity.md.
   */
  private readonly revision: WritableSignal<number> = signal(0);

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
    this.destroy$.complete();
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Protected methods
  // Both are guarded: the logic specs build datasets with Object.create(), which runs no field
  // initialiser, so `revision` is genuinely absent there. Nothing to notify and nothing to track
  // in that case, which is correct -- those specs assert state, not rendering.

  /** Announces that dataset state changed, so views reading it re-render. */
  protected touched(): void {
    this.revision?.update((revision: number) => revision + 1);
  }

  /** Takes a tracked dependency on the dataset's state. Call it first in any accessor. */
  protected tracked(): void {
    this.revision?.();
  }
  //#endregion

  //#region Private methods
  //#endregion
}
