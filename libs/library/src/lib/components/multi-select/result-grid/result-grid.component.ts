import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { MultiSelectResultDataset } from '../../../services/datasets/multi-select-result.dataset';
import { BaseComponent } from '../../base.component';
import { DataGridDataset } from '../../../services';

@Component({
  selector: 'lib-multi-select-result-grid',
  templateUrl: './result-grid.component.html',
  styleUrls: ['./result-grid.component.scss'],
  host: {
    class: 'flex-grow',
  },
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, TranslatePipe],
})
export class MultiSelectResultGridComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() isDisabled = false;
  @Input() template!: TemplateRef<any>;
  //#endregion

  //#region Variables
  protected dataGridDataset: DataGridDataset = inject(DataGridDataset);
  protected isLoading = true;
  protected resultDataset: MultiSelectResultDataset = inject(MultiSelectResultDataset);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.resultDataset.loadStarted.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isLoading = true;
    });

    this.resultDataset.loadFinished.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isLoading = false;
    });
  }
  //#endregion

  //#region Event handlers
  public onItemRemoved(rowIndex: number): void {
    const id: any = this.resultDataset.displayedIDs[rowIndex];

    // Removing used to go only through the grid on the left, which knows nothing about a row it
    // has not loaded -- and this panel lists entries the search may never have shown. The click
    // then did nothing at all. The dataset is told directly, and the grid is still told too so a
    // row that does happen to be loaded keeps its checkbox in step.
    this.resultDataset.setIDToRemove(id);
    this.dataGridDataset.deselectRowID(id);
  }

  protected onScrolled(event: any): void {
    const currentScroll: number = event.target.scrollTop + event.target.clientHeight;
    const scrollHeight: number = event.target.scrollHeight - event.target.clientHeight;

    if (currentScroll > scrollHeight && !this.isLoading && !this.resultDataset.loadedLastRow) {
      this.isLoading = true;
      this.resultDataset.loadRows();
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
