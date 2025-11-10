import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { DataGridDataset, RibbonButtonComponent, RibbonGroupChild } from '@library';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { AuthService } from '../../../services';
import { ConfirmModalComponent } from '../../modals';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-confirm',
  templateUrl: './button-confirm.component.html',
  imports: [
    ConfirmModalComponent,
    NgIf,
    RibbonButtonComponent,
    TranslatePipe,
  ],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonConfirmComponent)}]
})
export class ButtonConfirmComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ConfirmModalComponent) private confirmModal!: ConfirmModalComponent;

  @Input() public action!: Observable<any>;
  @Input() public color: string = 'text-primary-500';
  @Input() public icon!: string;
  @Input() public label!: string;
  @Input() public modalConfirmButtonColor!: string;
  @Input() public modalConfirmButtonLabel!: string;
  @Input() public modalMessage!: string;
  @Input() public modalMessageIcon: string = 'fa-solid fa-circle-question';
  @Input() public modalMessageIconColor!: string;
  @Input() public modalTitle!: string;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    protected gridDataset: DataGridDataset,
    authService: AuthService,
  ) {
    super(authService);
    
    this.disabled = true;
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    this.confirmModal.toggleModal();
  }

  protected onDelete(): void {
    if (this.confirmModal.isLoading || !this.confirmModal.isShown) {
      return;
    }
    
    this.confirmModal.beginLoading();

    this.action
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.finishLoading('success');
          this.confirmModal.finishLoading(true);
          this.gridDataset.refresh();
        },
        error: (e: HttpErrorResponse) => {
          this.confirmModal.setErrorMessage(e);
        }
      });
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}