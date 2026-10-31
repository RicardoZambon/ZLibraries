import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  LOCALE_ID,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ModalBase } from '@zambon-dev/ui/framework';
import { ModalComponent } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import {
  IOperationsHistoryField,
  IOperationsHistoryList,
  OPERATIONS_HISTORY_FIELD_LABEL,
  OperationsHistoryFieldLabel,
} from '../../../models';
import { formatFieldValue, getOperationFields, IOperationsHistoryValue } from '../operations-history-fields';

/** One line of the change details. */
interface IOperationsHistoryRow {
  isChanged: boolean;
  isSystem: boolean;
  label: string;
  name: string;
  newValue: IOperationsHistoryValue;
  oldValue: IOperationsHistoryValue;
}

@Component({
  selector: 'shared-operations-history-modal',
  templateUrl: './operations-history-modal.component.html',
  styleUrls: ['./operations-history-modal.component.scss'],
  imports: [ModalComponent, NgTemplateOutlet, TranslatePipe],
})
export class OperationsHistoryModalComponent extends ModalBase {
  //#region ViewChilds, Inputs, Outputs
  private readonly modal: Signal<ModalComponent | undefined> = viewChild(ModalComponent);

  /**
   * @deprecated Bind `operation` instead, which also carries the whole record. Read only when
   * `operation` is not bound.
   */
  public readonly newValues: InputSignal<object | null | undefined> = input<object | null>();

  /**
   * @deprecated Bind `operation` instead, which also carries the whole record. Read only when
   * `operation` is not bound.
   */
  public readonly oldValues: InputSignal<object | null | undefined> = input<object | null>();

  /** The operation whose changes the modal shows. */
  public readonly operation: InputSignal<IOperationsHistoryList | null | undefined> =
    input<IOperationsHistoryList | null>();
  //#endregion

  //#region Variables
  /** Whether the unchanged fields are listed too, rather than only what the operation changed. */
  protected readonly showAllFields: WritableSignal<boolean> = signal(false);

  /** Whether the bookkeeping fields are listed, when every field is. */
  protected readonly showSystemFields: WritableSignal<boolean> = signal(false);

  private readonly fieldLabel: OperationsHistoryFieldLabel = inject(OPERATIONS_HISTORY_FIELD_LABEL);
  private readonly locale: string = inject(LOCALE_ID);
  //#endregion

  //#region Properties
  /** Delegates to the inner modal; a signal query, so it re-runs once that child resolves. */
  public readonly isModalShown: Signal<boolean> = computed(() => this.modal()?.isOpen() ?? false);

  /** The operation shown, built from the deprecated inputs when `operation` is not bound. */
  protected readonly currentOperation: Signal<IOperationsHistoryList | null> = computed(() => {
    const operation: IOperationsHistoryList | null | undefined = this.operation();
    if (operation) {
      return operation;
    }

    const oldValues: object | null | undefined = this.oldValues();
    const newValues: object | null | undefined = this.newValues();
    if (!oldValues && !newValues) {
      return null;
    }

    return { id: 0, newValues: JSON.stringify(newValues ?? {}), oldValues: JSON.stringify(oldValues ?? {}) };
  });

  /** Only a backend that rebuilds the record sends the unchanged fields, so only then can they be listed. */
  protected readonly hasFullRecord: Signal<boolean> = computed(
    () => (this.currentOperation()?.fields?.length ?? 0) > 0,
  );

  protected readonly isAdded: Signal<boolean> = computed(() => this.currentOperation()?.operationType === 'Added');

  protected readonly isDeleted: Signal<boolean> = computed(() => this.currentOperation()?.operationType === 'Deleted');

  protected readonly operationLabel: Signal<string> = computed(() => {
    const operationType: string | undefined = this.currentOperation()?.operationType;
    return operationType ? `OperationsHistory-Operation-${operationType}` : '';
  });

  /** Data fields: the changed ones, or every one when asked. */
  protected readonly dataRows: Signal<IOperationsHistoryRow[]> = computed(() =>
    this.rows().filter((row: IOperationsHistoryRow) => !row.isSystem && (row.isChanged || this.showAllFields())),
  );

  /** Bookkeeping fields, listed apart and only when every field is. */
  protected readonly systemRows: Signal<IOperationsHistoryRow[]> = computed(() =>
    this.showAllFields() ? this.rows().filter((row: IOperationsHistoryRow) => row.isSystem) : [],
  );

  private readonly rows: Signal<IOperationsHistoryRow[]> = computed(() => {
    const operation: IOperationsHistoryList | null = this.currentOperation();

    return getOperationFields(operation).map((field: IOperationsHistoryField): IOperationsHistoryRow => ({
      isChanged: field.isChanged,
      isSystem: field.isSystem,
      label: this.fieldLabel(field.name, operation?.entityName),
      name: field.name,
      newValue: formatFieldValue(field.newValue, field.type, this.locale),
      oldValue: formatFieldValue(field.oldValue, field.type, this.locale),
    }));
  });
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onShowAllFieldsChanged(event: Event): void {
    this.showAllFields.set((<HTMLInputElement>event.target).checked);
  }

  protected onSystemFieldsToggled(): void {
    this.showSystemFields.update((isShown: boolean) => !isShown);
  }
  //#endregion

  //#region Public methods
  public toggle(): void {
    this.modal()?.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}
