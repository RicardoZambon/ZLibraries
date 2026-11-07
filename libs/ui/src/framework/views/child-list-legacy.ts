import { Component, inject, Input, OnInit } from '@angular/core';
import { DataGridDataset, MultiSelectResultDataset } from '@zambon-dev/ui/library';
import { takeUntil } from 'rxjs';
import { ViewBase } from './view-base';

// No strategy on purpose: Angular never inherits `changeDetection`, so one declared here would
// describe a class that is never instantiated, while every subclass compiles to whatever it
// declares -- which in v22 means OnPush. Correctness comes from the state below notifying
// Angular, never from this decorator. See docs/guides/reactivity.md.
/**
 * Base for a grid of child records whose parent is passed in through `entityId`. Follows the
 * grid's loading and selection.
 *
 * @deprecated Use {@link ChildList} instead. Migrate by extending ChildList
 * and using standalone component imports with inject() for dependency injection.
 */
@Component({ template: '' })
export abstract class ChildListLegacy extends ViewBase implements OnInit {
  private _entityId?: number;

  protected selectionCount = 0;

  /** ID of the parent record. Setting it scopes the grid to that record and loads its rows if none are loaded yet. */
  get entityId(): number | undefined {
    return this._entityId;
  }
  /** Sets the parent record; see the getter. */
  @Input() set entityId(value: number | undefined) {
    if (this._entityId !== value) {
      this._entityId = value;
      this.dataGridDataset.parentEntityId = value;

      if (!this.dataGridDataset.loadedRows) {
        this.dataGridDataset.refresh();
      }

      if (this.resultDataset) {
        this.resultDataset.parentEntityId = value;
      }
    }
  }

  /** Asks the list to disable its actions. Only takes effect where the subclass template reads it. Defaults to `false`. */
  @Input() disabled = false;

  protected dataGridDataset: DataGridDataset = inject(DataGridDataset);
  protected resultDataset: MultiSelectResultDataset | null = inject(MultiSelectResultDataset, { optional: true });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.dataGridDataset.loadStarted.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = true;
    });

    this.dataGridDataset.loadFinished.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = false;
    });

    if (!this.dataGridDataset.loadedRows) {
      this.loading = true;
    }

    this.dataGridDataset.selectedRowsChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedRowChanged();
    });
  }

  /** Called when the grid selection changes. Updates the selection count; subclasses may extend it. */
  selectedRowChanged(): void {
    this.selectionCount = this.dataGridDataset.selectedRowKeys.length;
  }
}
