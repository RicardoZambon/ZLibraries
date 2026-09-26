import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ChildList } from '@zambon-dev/framework';
import { DataGridComponent } from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { ServicesHistoryDataset } from '../../../datasets';
import { UtcDatePipe } from '../../../pipes';

@Component({
  selector: 'shared-services-history-child-list',
  templateUrl: './services-history-child-list.component.html',
  styleUrls: ['./services-history-child-list.component.scss'],
  imports: [DataGridComponent, DatePipe, UtcDatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  // No DataGridDataset provider of its own: ServicesHistoryViewComponent provides one, so that the
  // ribbon's buttons and this grid share a single instance. Used anywhere else, this component
  // needs a ServicesHistoryDataset provided above it.
})
export class ServicesHistoryChildListComponent extends ChildList<any> implements AfterViewInit, OnInit {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('serviceTemplate') private serviceTemplate!: TemplateRef<any>;

  @Input() public set controllerName(value: string) {
    (<ServicesHistoryDataset>this.dataGridDataset).controllerName = value;
  }

  /** Re-emits the grid's own filter changes, for a sibling list that has to follow them. */
  @Output() public filtersChanged: EventEmitter<{ [key: string]: string } | undefined> = new EventEmitter<
    { [key: string]: string } | undefined
  >();
  //#endregion

  //#region Variables
  public selectedServiceID?: number;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngAfterViewInit(): void {
    this.dataGridDataset.columns[0].template = this.serviceTemplate;
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.dataGridDataset.filtersChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters: { [key: string]: string } | undefined) => this.filtersChanged.emit(filters));
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public override selectedRowChanged(): void {
    super.selectedRowChanged();

    if (this.dataGridDataset.hasSelectedRows) {
      const selectedKey: string = this.dataGridDataset.selectedRowKeys[0];
      this.selectedServiceID = this.dataGridDataset.getRowID(selectedKey);
    }
  }
  //#endregion

  //#region Private methods
  //#endregion
}
