import { NgClass, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Optional, ViewChild } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { FormService, IModal, ModalComponent } from '@library';
import { TranslatePipe } from '@ngx-translate/core';
import { BackendFormValidationHelper } from '../../../helpers';

@Component({
  selector: 'framework-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  imports: [
    ModalComponent,
    NgClass,
    NgIf,
    TranslatePipe,
  ]
})
export class ConfirmModalComponent implements IModal {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ModalComponent) private modal!: ModalComponent;

  @Input() public errorMessage: string = '';
  @Input() public message: string = '';
  @Input() public messageIcon: string = 'fa-regular fa-circle-question';
  @Input() public messageIconColor: string = 'text-cyan-500';
  @Input() public showMessageIcon: boolean = true;
  @Input() public size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto' = 'xl';
  @Input() public title!: string;
  //#endregion

  //#region Variables
  public isLoading: boolean = false;
  //#endregion

  //#region Properties
  public get isShown(): boolean {
    return this.modal.isShown;
  }

  protected get hasErrorMessage(): boolean {
    return !!this.errorMessage && this.errorMessage.length > 0;
  }

  protected get hasMessage(): boolean {
    return !!this.message && this.message.length > 0;
  }

  private get formGroup(): FormGroup | null {
    return this.controlContainer?.control as FormGroup ?? null;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    @Optional() private controlContainer: ControlContainer,
    @Optional() protected formService?: FormService,
  ) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public beginLoading(): void {
    this.clearErrorMessage();
    this.isLoading = true;

    // if (!!this.formGroupOk){
    //   this.formGroupOk.disable();
    // }
  }
  
  public clearErrorMessage(): void {
    this.errorMessage = '';
  }

  public closeModal(): void {
    this.modal.closeModal();
  }

  public finishLoading(closeModal?: boolean): void {
    this.isLoading = false;

    if (this.formGroup && this.formGroup.disabled) {
      this.formGroup.enable();
    }

    if (closeModal) {
      this.closeModal();
    }
  }

  public setErrorMessage(httpErrorResponse: HttpErrorResponse): void {
    this.finishLoading();

    if (httpErrorResponse.status === 400 && !!this.formGroup) {
      BackendFormValidationHelper.validateAllFormFields(httpErrorResponse, this.formGroup);
    } else {
      if (typeof httpErrorResponse.error === 'string') {
        this.errorMessage = httpErrorResponse.error;
      } else {
        this.errorMessage = 'Modal-Failed-DefaultMessage';
      }
    }
  }

  public toggleModal(): void {
    if (!!this.formService && this.formService.loading) {
      return;
    }

    if (!!this.formGroup) {
      // TODO: TEST THIS CHANGE
      this.formGroup.reset()
      this.formService?.resetForm();
    }

    
    this.clearErrorMessage();
    this.modal.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}