import { HttpErrorResponse } from '@angular/common/http';
import { Component, forwardRef, inject, input, InputSignal, Signal, viewChild } from '@angular/core';
import {
  ButtonComponent,
  type ButtonIntent,
  DataGridDataset,
  RibbonButtonComponent,
  RibbonGroupChild,
} from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { ConfirmModalComponent } from '../../modals';
import { BaseButton } from '../base-button';

@Component({
  selector: 'framework-button-confirm',
  templateUrl: './button-confirm.component.html',
  imports: [ButtonComponent, ConfirmModalComponent, RibbonButtonComponent, TranslatePipe],
  providers: [{ provide: RibbonGroupChild, useExisting: forwardRef(() => ButtonConfirmComponent) }],
})
export class ButtonConfirmComponent extends BaseButton {
  //#region ViewChilds, Inputs, Outputs
  private readonly confirmModal: Signal<ConfirmModalComponent | undefined> = viewChild(ConfirmModalComponent);

  public readonly action: InputSignal<Observable<any>> = input.required<Observable<any>>();
  public readonly color: InputSignal<string> = input('text-primary-500');
  public readonly icon: InputSignal<string> = input('');
  public readonly label: InputSignal<string> = input('');
  /**
   * What the confirm button is for. Replaces `modalConfirmButtonColor`, which took a Tailwind
   * palette name -- `green-500` -- and so could neither follow a theme nor say what the button
   * meant.
   */
  public readonly modalConfirmButtonIntent: InputSignal<ButtonIntent> = input<ButtonIntent>('danger');
  public readonly modalConfirmButtonLabel: InputSignal<string> = input('');
  public readonly modalMessage: InputSignal<string> = input('');
  public readonly modalMessageIcon: InputSignal<string> = input('fa-solid fa-circle-question');
  public readonly modalMessageIconColor: InputSignal<string> = input('');
  public readonly modalTitle: InputSignal<string> = input('');
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
