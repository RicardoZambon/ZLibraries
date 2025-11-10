import { NgIf } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { DataProviderService, FormService, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { takeUntil } from 'rxjs';
import { AuthService } from '../../../services';
import { ModalBase } from '../../../views/modals/modal-base';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-edit',
  templateUrl: './button-edit.component.html',
  imports: [
    NgIf,
    RibbonButtonComponent,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonEditComponent)}]
})
export class ButtonEditComponent extends BaseButton implements OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public cancelColor: string = 'text-red-500';
  @Input() public cancelIcon: string = 'fa-ban';
  @Input() public cancelLabel: string = 'Button-Cancel-Edit';
  @Input() public editIcon: string = 'fa-edit';
  @Input() public editLabel: string = 'Button-Edit';
  @Input() public modal?: ModalBase;
  //#endregion

  //#region Variables
  protected isButtonCancelVisible: boolean = false;
  //#endregion

  //#region Properties
  protected get hasDataProviderEntityID(): boolean {
    return this.dataProviderService?.hasEntityID ?? false;
  }

  protected get isFormLoading(): boolean {
    return this.formService.loading;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    private dataProviderService: DataProviderService<any>,
    private formService: FormService,
    authService: AuthService,
  ) {
    super(authService);
  }

  public ngOnInit(): void {
    this.formService.editCanceled
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isButtonCancelVisible = false;
      });
  }
  //#endregion

  //#region Event handlers
  protected onCancelClicked(): void {
    if (this.isButtonCancelVisible) {
      this.isButtonCancelVisible = false;
      this.formService.cancelEdit();
    }
  }

  protected onEditClicked(): void {
    if (!!this.modal) {
      this.modal.toggle();
    } else {
      this.isButtonCancelVisible = true;
      this.formService.beginEdit();
    }
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}