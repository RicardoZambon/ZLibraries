import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxResizeObserverModule } from 'ngx-resize-observer';
import { takeUntil } from 'rxjs';
import { IGridColumn } from '../../models';
import { DataGridDataset } from '../../services/datasets/data-grid.dataset';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-data-grid-row',
  templateUrl: './data-grid-row.component.html',
  host: {
    '[class.focused]': 'dataGridDataset.focusedRow === rowData',
    '[class.selected]': 'dataGridDataset.isKeySelected(rowKey)',
  },
  styleUrls: ['./data-grid-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgClass,
    NgIf,
    NgFor,
    NgTemplateOutlet,
    NgxResizeObserverModule,
  ]
})
export class DataGridRowComponent extends BaseComponent implements OnInit {  
  //#region ViewChilds, Inputs, Outputs
  @Input() public disabled: boolean = false;
  @Input() public isFirstRow: boolean = false;
  @Input() public set rowData(value: any) {
    this._rowData = value;
    this.refreshSelection();
  }

  @Output() public selectionResized: EventEmitter<number> = new EventEmitter<number>();
  //#endregion

  //#region Host listeners
  @HostListener('click')
  public setFocus(): void {
    if (!this.disabled) {
      this.dataGridDataset.setFocusedRow(this.rowKey);
    
      if (this.dataGridDataset.configs.multiSelect && (this.dataGridDataset.configs.selectOnClick ?? true)) {
        this.selected = this.isRowDataSelected;
      }
    }
  }
  //#endregion

  //#region Variables
  private _rowData!: any;
  private isWidthSet: { [column: number]: boolean } = {};
  protected selected: boolean = false;
  //#endregion

  //#region Properties
  protected get columns(): IGridColumn[] {
    return this.dataGridDataset.columns;
  }

  private get isRowDataSelected(): boolean {
    return this.dataGridDataset.isKeySelected(this.rowKey)
  }

  public get rowData(): any {
    return this._rowData;
  }

  private get rowKey(): string {
    return this.dataGridDataset.getRowInternalKey(this.rowData);
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected changeDetectorRef: ChangeDetectorRef,
    protected dataGridDataset: DataGridDataset,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.selected = this.isRowDataSelected;

    this.dataGridDataset.selectedRowsChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectionChanges: { [id:string]: { rowData: any; selected: boolean } }) => {
        if (this.rowKey in selectionChanges) {
          this.selected = selectionChanges[this.rowKey].selected;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  //#endregion

  //#region Event handlers
  protected onResize(colIndex: number, event: ResizeObserverEntry): void {
    if (this.isWidthSet[colIndex]) {
      return;
    }

    const width: number = event.contentRect.width;
    if (width <= 0) {
      return;
    }

    if (this.columns[colIndex].realSize != width) {
      this.columns[colIndex].realSize = width;
      this.isWidthSet[colIndex] = true;
    }
  }

  protected onResizeSelection(event: ResizeObserverEntry): void {
    const width: number = event.contentRect.width;
    this.selectionResized.emit(width);
  }

  protected onToggleSelection(): void {
    if (this.disabled || (this.dataGridDataset.configs.multiSelect && (this.dataGridDataset.configs.selectOnClick ?? true))) {
      return;
    }
    
    this.selected = !this.selected;

    if (this.selected) {
      this.dataGridDataset.selectRow(this.rowKey);
    } else {
      this.dataGridDataset.deselectRow(this.rowKey);
    }
  }
  //#endregion

  //#region Public methods
  protected getValue(field: string): any {
    return field.split('.').reduce((value: any, field: string) => value[field], this.rowData);
  }
  //#endregion

  //#region Private methods
  private refreshSelection(): void {
    this.selected = this.isRowDataSelected;
  }
  //#endregion
}