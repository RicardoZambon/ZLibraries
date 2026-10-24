import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, input, InputSignal, Signal, viewChild } from '@angular/core';
import { DataGridDataset, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { ConfirmModalComponent } from '../../modals';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-delete',
  templateUrl: './button-delete.component.html',
  imports: [ConfirmModalComponent, RibbonButtonComponent, TranslatePipe],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonDeleteComponent) }],
})
export class ButtonDeleteComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  private readonly confirmModal: Signal<ConfirmModalComponent | undefined> = viewChild(ConfirmModalComponent);

  public readonly action: InputSignal<Observable<any>> = input.required<Observable<any>>();
  public readonly label: InputSignal<string> = input('Button-Delete');
  public readonly modalConfirmButtonLabel: InputSignal<string> = input('Modal-Delete-Confirm');
  public readonly modalMessage: InputSignal<string> = input('Modal-Delete-Message');
  public readonly modalTitle: InputSignal<string> = input('Modal-Delete-Title');
  //#endregion

  //#region Variables
  protected gridDataset: DataGridDataset = inject(DataGridDataset);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.disabled.set(true);
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    this.confirmModal()?.toggleModal();
  }

  protected onDelete(): void {
    const confirmModal: ConfirmModalComponent | undefined = this.confirmModal();
    if (!confirmModal || confirmModal.isLoading() || !confirmModal.isOpen()) {
      return;
    }

    confirmModal.beginLoading();

    this.action()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.finishLoading('success');
          confirmModal.finishLoading(true);
          this.gridDataset.refresh();
        },
        error: (e: HttpErrorResponse) => {
          confirmModal.setErrorMessage(e);
        },
      });
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}
