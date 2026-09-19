import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
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
  @Input() public disabled = false;
  @Input() public isFirstRow = false;
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
  protected changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected dataGridDataset: DataGridDataset = inject(DataGridDataset);
  protected selected = false;

  private _rowData!: any;
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  //#endregion

  //#region Properties
  public get rowData(): any {
    return this._rowData;
  }

  protected get columns(): IGridColumn[] {
    return this.dataGridDataset.columns;
  }

  private get isLaidOut(): boolean {
    return (this.elementRef.nativeElement?.getBoundingClientRect().width ?? 0) > 0;
  }

  private get isRowDataSelected(): boolean {
    return this.dataGridDataset.isKeySelected(this.rowKey)
  }

  private get rowKey(): string {
    return this.dataGridDataset.getRowInternalKey(this.rowData);
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
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
    const width: number = event.contentRect.width;

    // A zero means one of two very different things. Before the grid is laid out every column
    // reports zero, and taking that at face value would pin every heading at zero. Once the row
    // itself has a width the layout is live, and a zero is then the real thing: a 1fr column
    // collapsed for want of room, whose heading has to collapse with it or every column to its
    // right sits under the wrong one. Asking the row -- rather than remembering whether this
    // column once measured something -- also covers a column that is born collapsed and never
    // measures anything else.
    if (width <= 0 && !this.isLaidOut) {
      return;
    }

    // Reported on every change, not just the first. The body lays the columns out as a CSS grid of
    // minmax(x, min-content), so a column is only as wide as the content currently rendered --
    // which virtual scrolling keeps changing. Measuring once and latching left the header copying
    // a width the body no longer had, and with many columns that drift accumulated into cells
    // sitting under the wrong heading.
    if (this.columns[colIndex].realSize !== width) {
      this.columns[colIndex].realSize = width;
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
