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
import { ModalComponent, ModalSize } from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';

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
  public readonly errorMessage: ModelSignal<string> = model('');

  public readonly size: InputSignal<ModalSize> = input<ModalSize>('xl');
  // Models too: DefaultDetailsTabViewComponent sets both before showing the modal, so that a 404
  // reads as "record not found" rather than as a server error.
  public readonly subtitle: ModelSignal<string> = model('Modal-Failed-Administrator');
  public readonly title: ModelSignal<string> = model('Modal-Failed-Title');

  public readonly closed: OutputEmitterRef<void> = output<void>();
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  /**
   * Delegates to the inner modal. A signal view query, not @ViewChild: a computed reading a plain
   * query would never re-run when the query resolves, so the wrapper would answer against an
   * undefined child for ever.
   */
  public readonly isOpen: Signal<boolean> = computed(() => this.modal()?.isOpen() ?? false);
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public closeModal(): void {
    this.modal()?.closeModal();
  }

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
