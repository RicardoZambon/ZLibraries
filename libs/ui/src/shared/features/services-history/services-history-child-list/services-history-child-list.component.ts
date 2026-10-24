import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ChildList } from '@zambon-dev/ui/framework';
import { DataGridComponent } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { ServicesHistoryDataset } from '../../../datasets';
import { UtcDatePipe } from '../../../pipes';

@Component({
  selector: 'shared-services-history-child-list',
  templateUrl: './services-history-child-list.component.html',
  styleUrls: ['./services-history-child-list.component.scss'],
  imports: [DataGridComponent, DatePipe, UtcDatePipe, TranslatePipe],
  // No DataGridDataset provider of its own: ServicesHistoryViewComponent provides one, so that the
  // ribbon's buttons and this grid share a single instance. Used anywhere else, this component
  // needs a ServicesHistoryDataset provided above it.
})
export class ServicesHistoryChildListComponent extends ChildList<any> implements AfterViewInit, OnInit {
  //#region ViewChilds, Inputs, Outputs
  private readonly serviceTemplate: Signal<TemplateRef<any> | undefined> =
    viewChild<TemplateRef<any>>('serviceTemplate');

  @Input() public set controllerName(value: string) {
    (<ServicesHistoryDataset>this.dataGridDataset).controllerName = value;
  }

  /** Re-emits the grid's own filter changes, for a sibling list that has to follow them. */
  public readonly filtersChanged: OutputEmitterRef<{ [key: string]: string } | undefined> = output<
    { [key: string]: string } | undefined
  >();
  //#endregion

  //#region Variables
  // A signal: it is bound into the operations list beside this one, and both the row callback
  // and the grid's load event write it from outside any binding on this view.
  public readonly selectedServiceID: WritableSignal<number | undefined> = signal(undefined);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngAfterViewInit(): void {
    this.dataGridDataset.columns[0].template = this.serviceTemplate();
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.dataGridDataset.filtersChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters: { [key: string]: string } | undefined) => this.filtersChanged.emit(filters));

    // Reloading clears the grid's selection but would leave the last chosen service behind, and
    // the operations list beside it still showing that service's rows -- a service the new filters
    // may not even list any more. Dropped here so the two panels never disagree.
    this.dataGridDataset.loadStarted.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedServiceID.set(undefined);
    });
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public override selectedRowChanged(): void {
    super.selectedRowChanged();

    if (this.dataGridDataset.hasSelectedRows) {
      const selectedKey: string = this.dataGridDataset.selectedRowKeys[0];
      this.selectedServiceID.set(this.dataGridDataset.getRowID(selectedKey));
    }
  }
  //#endregion

  //#region Private methods
  //#endregion
}
