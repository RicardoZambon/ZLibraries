import { JsonPipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ModalBase } from '@framework';
import { FormService, ModalComponent } from '@library';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'shared-operations-history-modal',
  templateUrl: './operations-history-modal.component.html',
  styleUrls: ['./operations-history-modal.component.scss'],
  imports: [
    JsonPipe,
    ModalComponent,
    TranslatePipe,
  ],
  providers: [{ provide: FormService }]
})
export class OperationsHistoryModalComponent extends ModalBase {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ModalComponent) private modal!: ModalComponent;

  @Input() public newValues?: string;

  @Input() public oldValues?: string;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  public get isModalShown(): boolean {
    return this.modal.isShown;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public toggle(): void {
    this.modal.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}