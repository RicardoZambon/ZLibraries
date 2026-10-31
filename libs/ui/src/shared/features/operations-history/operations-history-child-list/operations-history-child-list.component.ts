import { AfterViewInit, Component, Input, signal, Signal, TemplateRef, viewChild, WritableSignal } from '@angular/core';
import { ChildList } from '@zambon-dev/ui/framework';
import { DataGridComponent, DataGridDataset } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { OperationsHistoryDataset } from '../../../datasets';
import { IOperationsHistoryList } from '../../../models';
import { countChangedFields } from '../operations-history-fields';
import { OperationsHistoryModalComponent } from '../operations-history-modal/operations-history-modal.component';

@Component({
  selector: 'shared-operations-history-child-list',
  templateUrl: './operations-history-child-list.component.html',
  styleUrls: ['./operations-history-child-list.component.scss'],
  imports: [DataGridComponent, OperationsHistoryModalComponent, TranslatePipe],
  providers: [{ provide: DataGridDataset, useClass: OperationsHistoryDataset }],
})
export class OperationsHistoryChildListComponent extends ChildList<any> implements AfterViewInit {
  //#region ViewChilds, Inputs, Outputs
  private readonly modal: Signal<OperationsHistoryModalComponent | undefined> = viewChild(
    OperationsHistoryModalComponent,
  );
  private readonly operationTemplate: Signal<TemplateRef<any> | undefined> =
    viewChild<TemplateRef<any>>('operationTemplate');

  @Input() public set controllerName(value: string) {
    (<OperationsHistoryDataset>this.dataGridDataset).controllerName = value;
  }

  /**
   * Filters to send with the list.
   *
   * The audit view applies its filters to the services grid and hands the same set here, because
   * one of them -- whether to list only the audited record's own operations -- belongs to this
   * list. The rest mean nothing to it, and the backend reads only what it recognises.
   *
   * `setFilters` refreshes the grid itself. With no service selected the dataset answers with an
   * empty list rather than calling the backend, so a refresh then costs nothing.
   */
  @Input() public set filters(value: { [key: string]: string } | undefined) {
    this.dataGridDataset.setFilters(value);
  }

  @Input() public set serviceID(value: number | undefined) {
    (<OperationsHistoryDataset>this.dataGridDataset).serviceId = value;
  }
  //#endregion

  //#region Variables
  // Signals: they are bound into the modal and are filled when a row is picked, which the grid
  // reports through a callback rather than a binding on this view.
  /** @deprecated Read `selectedOperation` instead, which also carries the whole record. */
  public readonly selectedNewValues: WritableSignal<any | null> = signal(null);
  /** @deprecated Read `selectedOperation` instead, which also carries the whole record. */
  public readonly selectedOldValues: WritableSignal<any | null> = signal(null);
  public readonly selectedOperation: WritableSignal<IOperationsHistoryList | null> = signal(null);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngAfterViewInit(): void {
    this.dataGridDataset.columns[0].template = this.operationTemplate();
  }
  //#endregion

  //#region Event handlers
  /** How many data fields an operation changed, for the summary beside it. */
  protected changedFieldsOf(operation: IOperationsHistoryList): number {
    return countChangedFields(operation);
  }

  public openModal(): void {
    const modal: OperationsHistoryModalComponent | undefined = this.modal();
    if (modal && !modal.isModalShown()) {
      modal.toggle();
    }
  }
  //#endregion

  //#region Public methods
  public override selectedRowChanged(): void {
    super.selectedRowChanged();

    if (this.dataGridDataset.hasSelectedRows) {
      const key: string = this.dataGridDataset.selectedRowKeys[0];

      const data: IOperationsHistoryList = this.dataGridDataset.getRowData(key);
      this.selectedOperation.set(data);
      this.selectedOldValues.set(parseJson(data.oldValues));
      this.selectedNewValues.set(parseJson(data.newValues));
    }
  }
  //#endregion

  //#region Private methods
  //#endregion
}

/** Parses stored values, reading a missing or malformed one as nothing rather than throwing. */
function parseJson(json: string | undefined): unknown {
  if (!json?.trim()) {
    return null;
  }

  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
