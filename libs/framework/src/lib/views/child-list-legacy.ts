import { Component, Input, OnInit, Optional } from '@angular/core';
import { DataGridDataset, MultiSelectResultDataset } from '@library';
import { takeUntil } from 'rxjs';
import { ViewBase } from './view-base';

@Component({ template: '' })
export abstract class ChildListLegacy extends ViewBase implements OnInit {

  private _entityId?: number;

  protected selectionCount: number = 0;

  get entityId(): number | undefined {
    return this._entityId;
  }
  @Input() set entityId(value: number | undefined) {
    if (this._entityId !== value) {
      this._entityId = value;
      this.dataGridDataset.parentEntityId = value;

      if (!this.dataGridDataset.loadedRows) {
        this.dataGridDataset.refresh();
      }
      
      if (!!this.resultDataset) {
        this.resultDataset.parentEntityId = value;
      }
    }
  }

  @Input() disabled: boolean = false;


  constructor(
    protected dataGridDataset: DataGridDataset,
    @Optional() protected resultDataset: MultiSelectResultDataset | null
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataGridDataset.loadStarted
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.loading = true;
    });

    this.dataGridDataset.loadFinished
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.loading = false;
    });

    if (!this.dataGridDataset.loadedRows) {
      this.loading = true;
    }

    this.dataGridDataset.selectedRowsChanged
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.selectedRowChanged();
    });
  }
  

  selectedRowChanged(): void {
    this.selectionCount = this.dataGridDataset.selectedRowKeys.length;
  }
}