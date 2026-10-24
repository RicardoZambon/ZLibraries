import { JsonPipe } from '@angular/common';
import { Component, computed, input, InputSignal, Signal, viewChild } from '@angular/core';
import { ModalBase } from '@zambon-dev/ui/framework';
import { ModalComponent } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'shared-operations-history-modal',
  templateUrl: './operations-history-modal.component.html',
  styleUrls: ['./operations-history-modal.component.scss'],
  imports: [JsonPipe, ModalComponent, TranslatePipe],
})
export class OperationsHistoryModalComponent extends ModalBase {
  //#region ViewChilds, Inputs, Outputs
  private readonly modal: Signal<ModalComponent | undefined> = viewChild(ModalComponent);

  public readonly newValues: InputSignal<string | undefined> = input<string>();

  public readonly oldValues: InputSignal<string | undefined> = input<string>();
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  /** Delegates to the inner modal; a signal query, so it re-runs once that child resolves. */
  public readonly isModalShown: Signal<boolean> = computed(() => this.modal()?.isOpen() ?? false);
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public toggle(): void {
    this.modal()?.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}
