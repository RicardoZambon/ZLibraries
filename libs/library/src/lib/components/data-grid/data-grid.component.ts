import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgStyle } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  InputSignal,
  NgZone,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, filter, fromEvent, Subject, takeUntil } from 'rxjs';
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
    '[class.no-borders]': 'showButtons()',
  },
  imports: [DataGridRowComponent, NgStyle, ScrollingModule, TranslatePipe],
})
export class DataGridComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  private readonly bodyElement: Signal<ElementRef<HTMLDivElement> | undefined> =
    viewChild<ElementRef<HTMLDivElement>>('body');
  private readonly viewport: Signal<CdkVirtualScrollViewport | undefined> = viewChild(CdkVirtualScrollViewport);

  public readonly disabled: InputSignal<boolean> = input(false);
  public readonly lazyLoadRows: InputSignal<boolean> = input(false);
  public readonly showButtons: InputSignal<boolean> = input(false);
  //#endregion

  //#region Variables
  protected dataGridDataset: DataGridDataset = inject(DataGridDataset);
  protected readonly hasFailed: WritableSignal<boolean> = signal(false);
  protected readonly headerRightMargin: WritableSignal<number> = signal(0);
  protected readonly headerScrollLeft: WritableSignal<number> = signal(0);
  protected readonly loading: WritableSignal<boolean> = signal(false);

  private bodyResized$: Subject<void> = new Subject<void>();
  private bodyResizeObserver?: ResizeObserver;
  private gridRoute = '';
  private isGridCurrentUrl = false;
  private lastPosition = 0;
  private ngZone: NgZone = inject(NgZone);
  private router: Router = inject(Router);
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

  protected get hasBeenLoaded(): boolean {
    return this.dataGridDataset.hasBeenLoaded;
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

  protected get messageToDisplayWhenLazyLoad(): string {
    return this.dataGridDataset?.configs?.messageOnLazyLoad ?? '';
  }

  protected get messageToDisplayWhenFailed(): string {
    return this.dataGridDataset?.configs?.messageOnFailed ?? '';
  }

  protected get selectionColWidth(): string {
    return this.selectionColRealSize
      ? `${this.selectionColRealSize}px`
      : (this.configs.multiSelectSize ?? 'minmax(1.5rem,min-content)');
  }

  protected get shouldDisplayMessageWhenEmpty(): boolean {
    return this.dataGridDataset?.configs?.showMessageOnEmpty ?? true;
  }

  /**
   * Whether the grid is in the document, which it is not while the route-reuse strategy holds its
   * view detached -- the list a tab keeps in its history while the user is on a record.
   *
   * Nothing may measure the CDK viewport then. The body leaving the document is itself a resize,
   * to nothing, and measuring makes the viewport work out its rendered range from a scroll offset
   * of 0 and write that out while detached, which leaves its own change-detection flag stuck until
   * the view renders again. Reattached and scrolled back, the viewport then computes the right
   * range but cannot write the content offset out: the rows are rendered, translated to the top,
   * and the viewport shows the place the user had scrolled to -- an empty list. Coming back is a
   * resize as well, from nothing to the panel, so the measurement still happens, on the way in.
   */
  private get isBodyAttached(): boolean {
    return this.bodyElement()!?.nativeElement?.isConnected ?? false;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.gridRoute = this.router.url;
    this.isGridCurrentUrl = true;

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((events: any) => events instanceof NavigationStart || events instanceof NavigationEnd),
      )
      .subscribe((event: NavigationStart | NavigationEnd) => {
        if (event instanceof NavigationStart && this.isGridCurrentUrl) {
          this.lastPosition = this.viewport()?.measureScrollOffset() ?? 0;
          this.isGridCurrentUrl = false;
        } else if (event instanceof NavigationEnd && event.url === this.gridRoute) {
          this.viewport()?.scrollTo({ top: this.lastPosition });
          this.viewport()?.checkViewportSize();
          this.isGridCurrentUrl = true;
        }
      });

    this.dataGridDataset.loadStarted.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading.set(true);
    });

    this.dataGridDataset.loadFinished.pipe(takeUntil(this.destroy$)).subscribe((isSuccess: boolean) => {
      this.loading.set(false);
      this.hasFailed.set(!isSuccess);

      setTimeout(() => {
        const viewportWidth: number = this.viewport()?.measureViewportSize('horizontal') ?? 0;
        if (viewportWidth > 0) {
          this.headerRightMargin.set(this.bodyElement()!.nativeElement.clientWidth - viewportWidth);
        }
      }, 100);

      // A load can finish after the user has left the list -- a record opened while the next page
      // was still coming in -- and a detached grid must not be measured. See isBodyAttached.
      setTimeout(() => {
        if (this.isBodyAttached) {
          this.viewport()?.checkViewportSize();
        }
      });
    });

    if (!this.lazyLoadRows()) {
      if (!this.dataGridDataset.loadedRows) {
        this.loading.set(true);
      }
      this.dataGridDataset.loadRows();
    } else if (this.dataGridDataset.isLoading) {
      this.loading.set(true);
    }
  }

  public ngAfterViewInit(): void {
    // The rows scroll sideways inside the CDK viewport while the header sits outside it, so the
    // header has to be moved by hand or the headings stay behind as the cells travel. Read outside
    // Angular and written back inside it, because this fires for every frame of a scroll.
    const viewportElement: HTMLElement | undefined = this.viewport()?.elementRef?.nativeElement;

    if (viewportElement) {
      this.ngZone.runOutsideAngular(() => {
        fromEvent(viewportElement, 'scroll')
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            const scrollLeft: number = viewportElement.scrollLeft;
            if (this.headerScrollLeft() === scrollLeft) {
              return;
            }

            this.headerScrollLeft.set(scrollLeft);
          });
      });
    }

    this.viewport()
      ?.renderedRangeStream.pipe(takeUntil(this.destroy$))
      .subscribe((listRange: ListRange) => {
        const loadedRows: number = this.dataGridDataset.loadedRows?.length ?? 0;
        if (
          this.hasLoadedRows &&
          !this.loading() &&
          listRange.end >= loadedRows &&
          !this.dataGridDataset.loadedLastRow
        ) {
          this.loading.set(true);
          this.dataGridDataset.loadRows();
        }
      });

    this.bodyResized$.pipe(debounceTime(150), takeUntil(this.destroy$)).subscribe(() => {
      // Leaving the document is a resize too. A detached grid has nothing to measure, and measuring
      // it is what left the list empty when it came back; see isBodyAttached.
      if (!this.isBodyAttached) {
        return;
      }

      const viewportWidth: number = this.viewport()?.measureViewportSize('horizontal') ?? 0;
      if (viewportWidth > 0) {
        this.headerRightMargin.set(this.bodyElement()!.nativeElement.clientWidth - viewportWidth);
      }
      this.viewport()?.checkViewportSize();
      this.syncHeaderScroll();
    });

    this.ngZone.runOutsideAngular(() => {
      this.bodyResizeObserver = new ResizeObserver(() => {
        this.bodyResized$.next();
      });
      this.bodyResizeObserver.observe(this.bodyElement()!.nativeElement);
    });
  }

  public override ngOnDestroy(): void {
    this.bodyResizeObserver?.disconnect();
    super.ngOnDestroy();
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
    const renderedRange: ListRange | undefined = this.viewport()?.getRenderedRange();
    if (renderedRange) {
      return rowIndex === renderedRange.start;
    }
    return false;
  }
  //#endregion

  //#region Private methods
  private syncHeaderScroll(): void {
    // Re-inserting the viewport into the DOM -- which is what re-activating a detached tab does --
    // puts its scroll position back to zero without firing a scroll event, so nothing tells the
    // header to come back with it and the headings sit at an offset the body no longer has.
    const scrollLeft: number = this.viewport()?.elementRef?.nativeElement?.scrollLeft ?? 0;

    if (this.headerScrollLeft() !== scrollLeft) {
      this.headerScrollLeft.set(scrollLeft);
    }
  }

  protected trackByFn(index: number, item: any): number {
    return item.key;
  }
  //#endregion
}
