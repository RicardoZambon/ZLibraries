import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, input, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { DataGridDataset, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { ConfirmModalComponent } from '../../modals';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-delete',
  templateUrl: './button-delete.component.html',
  imports: [ConfirmModalComponent, RibbonButtonComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonDeleteComponent) }],
})
export class ButtonDeleteComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild(ConfirmModalComponent) private confirmModal!: ConfirmModalComponent;

  @Input() public action!: Observable<any>;
  @Input() public label = 'Button-Delete';
  @Input() public modalConfirmButtonLabel = 'Modal-Delete-Confirm';
  @Input() public modalMessage = 'Modal-Delete-Message';
  @Input() public modalTitle = 'Modal-Delete-Title';
  //#endregion

  //#region Variables
  protected gridDataset: DataGridDataset = inject(DataGridDataset);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

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

    this.action.pipe(take(1)).subscribe({
      next: () => {
        this.finishLoading('success');
        this.confirmModal.finishLoading(true);
        this.gridDataset.refresh();
      },
      error: (e: HttpErrorResponse) => {
        this.confirmModal.setErrorMessage(e);
      },
    });
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
