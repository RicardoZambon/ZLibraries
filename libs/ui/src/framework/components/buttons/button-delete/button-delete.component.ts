import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, input, InputSignal, Signal, viewChild } from '@angular/core';
import { ButtonComponent, DataGridDataset, RibbonButtonComponent, RibbonGroupChild } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { ConfirmModalComponent } from '../../modals';
import { BaseButton } from '../base-button';

/**
 * Red ribbon button that asks for confirmation in a modal, then runs the delete `action`. On
 * success it closes the modal and refreshes the surrounding data grid. Starts disabled.
 */
@Component({
  selector: 'framework-button-delete',
  templateUrl: './button-delete.component.html',
  imports: [ButtonComponent, ConfirmModalComponent, RibbonButtonComponent, TranslatePipe],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonDeleteComponent) }],
})
export class ButtonDeleteComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  private readonly confirmModal: Signal<ConfirmModalComponent | undefined> = viewChild(ConfirmModalComponent);

  /** Delete request to run once the user confirms. Required. */
  public readonly action: InputSignal<Observable<any>> = input.required<Observable<any>>();
  /** Translation key of the ribbon button's label. Defaults to `Button-Delete`. */
  public readonly label: InputSignal<string> = input('Button-Delete');
  /** Translation key of the modal's confirm button. Defaults to `Modal-Delete-Confirm`. */
  public readonly modalConfirmButtonLabel: InputSignal<string> = input('Modal-Delete-Confirm');
  /** Translation key of the message in the modal. May contain HTML. Defaults to `Modal-Delete-Message`. */
  public readonly modalMessage: InputSignal<string> = input('Modal-Delete-Message');
  /** Translation key of the modal's title. Defaults to `Modal-Delete-Title`. */
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
