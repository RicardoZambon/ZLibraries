import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, takeUntil } from 'rxjs';
import { IGridColumn } from '../../models';
import { DataGridConfigs } from '../../models/configs';
import { DataGridDataset } from '../../services';
import { BaseComponent } from '../base.component';
import { DataGridRowComponent } from '../data-grid-row/data-grid-row.component';

@Component({
  selector: 'lib-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
  host: {
    '[class.no-borders]': 'showButtons',
  },
  imports: [
    DataGridRowComponent,
    NgFor,
    NgIf,
    NgStyle,
    ScrollingModule,
    TranslatePipe,
  ]
})
export class DataGridComponent extends BaseComponent implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('body') private bodyElement!: ElementRef<HTMLDivElement>;
  @ViewChild(CdkVirtualScrollViewport) private viewport?: CdkVirtualScrollViewport;
  
  @Input() disabled: boolean = false;
  @Input() lazyLoadRows: boolean = false;
  @Input() showButtons: boolean = false;
  //#endregion

  //#region Variables
  private gridRoute: string = '';
  protected hasFailed: boolean = false;
  protected headerRightMargin: number = 0;
  private isGridCurrentUrl: boolean = false;
  private lastPosition: number = 0;
  protected loading: boolean = false;
  private selectionColRealSize?: number;
  //#endregion

  //#region Properties
  protected get bodyMinHeight(): number {
    let rowsToDisplay: number = this.configs.rowsToDisplay ?? 3;
    
    let rowsCount: number = this.dataGridDataset.loadedRows?.length ?? 0;
    if (rowsCount === 0) {
      rowsCount = 1;
    }

    if (rowsCount < rowsToDisplay) {
      rowsToDisplay = rowsCount;
    }

    return rowsToDisplay * this.configs.rowHeight;
  }

  protected get columns(): IGridColumn[] {
    return this.dataGridDataset.columns;
  }

  protected get configs(): DataGridConfigs {
    return this.dataGridDataset.configs;
  }

  protected get gridColumns(): string {
    return this.dataGridDataset.columnsSize;
  }

  protected get hasLoadedRows(): boolean {
    return (this.dataGridDataset.loadedRows?.length ?? 0) > 0;
  }

  protected get hasMessageToDisplayWhenEmpty(): boolean {
    return this.messageToDisplayWhenEmpty.length > 0;
  }

  protected get isHideColumns(): boolean {
    return this.dataGridDataset.configs.hideColumnHeaders ?? false;
  }

  protected get isShowMultiSelect(): boolean {
    return this.dataGridDataset.configs.multiSelect ?? false;
  }

  protected get messageToDisplayWhenEmpty(): string {
    return this.dataGridDataset?.configs?.messageOnEmpty ?? '';
  }

  protected get messageToDisplayWhenFailed(): string {
    return this.dataGridDataset?.configs?.messageOnFailed ?? '';
  }

  protected get selectionColWidth(): string {
    return this.selectionColRealSize
      ? `${this.selectionColRealSize}px`
      : this.configs.multiSelectSize ?? 'minmax(1.5rem,min-content)';
  }

  protected get shouldDisplayMessageWhenEmpty(): boolean {
    return this.dataGridDataset?.configs?.showMessageOnEmpty ?? true;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected changeDetectorRef: ChangeDetectorRef,
    protected dataGridDataset: DataGridDataset,
    private router: Router,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.gridRoute = this.router.url;
    this.isGridCurrentUrl = true;

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((events: any) => events instanceof NavigationStart || events instanceof NavigationEnd)
      )
      .subscribe((event: NavigationStart | NavigationEnd) => {
        if (event instanceof NavigationStart && this.isGridCurrentUrl) {
          this.lastPosition = this.viewport?.measureScrollOffset() ?? 0;
          this.isGridCurrentUrl = false;
          
        } else if (event instanceof NavigationEnd && event.url === this.gridRoute) {
          this.viewport?.scrollTo({ top: this.lastPosition });
          this.viewport?.checkViewportSize();
          this.isGridCurrentUrl = true;
        }
      });
    
    this.dataGridDataset.loadStarted
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loading = true;
      });

    this.dataGridDataset.loadFinished
      .pipe(takeUntil(this.destroy$))
      .subscribe((isSuccess: boolean) => {
        this.loading = false;
        this.hasFailed = !isSuccess;

        setTimeout(() => {
          const viewportWidth: number = this.viewport?.measureViewportSize('horizontal') ?? 0;
          if (viewportWidth > 0) {
            this.headerRightMargin = this.bodyElement.nativeElement.clientWidth - viewportWidth;
          }
        }, 100);

        this.changeDetectorRef.detectChanges();

        setTimeout(() => {
          this.viewport?.checkViewportSize();
        });
      });

      
    if (!this.lazyLoadRows) {
      if (!this.dataGridDataset.loadedRows) {
        this.loading = true;
      }
      this.dataGridDataset.loadRows();
    }
  }

  public ngAfterViewInit(): void {
    this.viewport?.renderedRangeStream
      .pipe(takeUntil(this.destroy$))
      .subscribe((listRange: ListRange) => {
        const loadedRows: number = this.dataGridDataset.loadedRows?.length ?? 0;
        if (this.hasLoadedRows && !this.loading && listRange.end >= loadedRows && !this.dataGridDataset.loadedLastRow) {
          this.loading = true;
          this.dataGridDataset.loadRows();
        }
      });
  }
  //#endregion

  //#region Event handlers
  protected onSelectionResized(newSize: number): void {
    if (this.selectionColRealSize != newSize) {
      this.selectionColRealSize = newSize;
    }
  }
  //#endregion

  //#region Public methods
  protected isFirstVisibleRow(rowIndex: number): boolean {
    const renderedRange: ListRange | undefined = this.viewport?.getRenderedRange();
    if (renderedRange) {
      return rowIndex === renderedRange.start;
    }
    return false;
  }
  //#endregion

  //#region Private methods
  protected trackByFn(index: number, item: any): number {
    return item.key;
  }
  //#endregion
}