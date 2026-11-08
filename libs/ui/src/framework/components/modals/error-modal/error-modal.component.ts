import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  input,
  InputSignal,
  model,
  ModelSignal,
  output,
  OutputEmitterRef,
  Signal,
  viewChild,
} from '@angular/core';
import { ModalComponent, ModalSize } from '@zambon-dev/ui/library';
import { TranslatePipe } from '@ngx-translate/core';

/** Modal that shows an error message with a title and subtitle. Open it with `showModal()`. */
@Component({
  selector: 'framework-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
  imports: [ModalComponent, TranslatePipe],
})
export class ErrorModalComponent {
  //#region ViewChilds, Inputs, Outputs
  private readonly modal: Signal<ModalComponent | undefined> = viewChild(ModalComponent);

  // A model rather than an input: showModal() writes it, and a parent calls that from its own
  // subscription. As a plain field the message landed with nothing marking this view dirty.
  /** Translation key or text of the error. `showModal()` sets it. Defaults to `''`. */
  public readonly errorMessage: ModelSignal<string> = model('');

  /** Width of the modal. Defaults to `xl`. */
  public readonly size: InputSignal<ModalSize> = input<ModalSize>('xl');
  // Models too: DefaultDetailsTabViewComponent sets both before showing the modal, so that a 404
  // reads as "record not found" rather than as a server error.
  /** Translation key shown under the error. Defaults to `Modal-Failed-Administrator`; empty hides it. */
  public readonly subtitle: ModelSignal<string> = model('Modal-Failed-Administrator');
  /** Translation key of the modal's title. Defaults to `Modal-Failed-Title`. */
  public readonly title: ModelSignal<string> = model('Modal-Failed-Title');

  /** Emits when the modal closes. */
  public readonly closed: OutputEmitterRef<void> = output<void>();
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  /** Whether the modal is open. */
  public readonly isOpen: Signal<boolean> = computed(() => this.modal()?.isOpen() ?? false);
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  /** Closes the modal. */
  public closeModal(): void {
    this.modal()?.closeModal();
  }

  /**
   * Shows `error` in the modal. Accepts a message or translation key, or an HTTP error whose body is
   * text; anything else shows a default message. Toggles the modal, so a call while it is open
   * closes it.
   */
  public showModal(error: string | HttpErrorResponse): void {
    let errorMessage = 'Modal-Failed-DefaultMessage';
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    }
    this.errorMessage.set(errorMessage);
    this.modal()?.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}
