import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
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
    'class': 'flex-grow'
  },
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    TranslatePipe,
  ]
})
export class MultiSelectResultGridComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() isDisabled: boolean = false;
  @Input() template!: TemplateRef<any>;
  //#endregion

  //#region Variables
  protected isLoading: boolean = true;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected dataGridDataset: DataGridDataset,
    protected resultDataset: MultiSelectResultDataset) {
    super();  
  }

  public ngOnInit(): void {
    this.resultDataset.loadStarted
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isLoading = true;
      });

    this.resultDataset.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isLoading = false;
      });
  }
  //#endregion

  //#region Event handlers
  public onItemRemoved(rowIndex: number): void {
    const id: any = this.resultDataset.displayedIDs[rowIndex];
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