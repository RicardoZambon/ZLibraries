import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Optional, ViewChild } from '@angular/core';
import { FormService, ModalComponent } from '@library';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'framework-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
  imports: [
    ModalComponent,
    TranslatePipe,
  ]
})
export class ErrorModalComponent {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ModalComponent) private modal!: ModalComponent;

  @Input() public errorMessage: string = '';
  @Input() public size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto' = 'xl';
  @Input() public title: string = 'Modal-Failed-Title';
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  public get isShown(): boolean {
    return this.modal.isShown;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(@Optional() protected formService?: FormService) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public closeModal(): void {
    this.modal.closeModal();
  }

  public showModal(error: string | HttpErrorResponse): void {
    let errorMessage: string = 'Modal-Failed-DefaultMessage';
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    }
    this.errorMessage = errorMessage;
    this.modal.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}