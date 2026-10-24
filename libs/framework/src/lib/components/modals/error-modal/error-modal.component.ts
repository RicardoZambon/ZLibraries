import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  Signal,
  viewChild,
} from '@angular/core';
import { ModalComponent } from '@zambon-dev/library';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'framework-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ModalComponent, TranslatePipe],
})
export class ErrorModalComponent {
  //#region ViewChilds, Inputs, Outputs
  private readonly modal: Signal<ModalComponent | undefined> = viewChild(ModalComponent);

  @Input() public errorMessage = '';
  @Input() public size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto' =
    'xl';
  @Input() public subtitle = 'Modal-Failed-Administrator';
  @Input() public title = 'Modal-Failed-Title';

  @Output() public closed: EventEmitter<void> = new EventEmitter<void>();
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
    this.errorMessage = errorMessage;
    this.modal()?.toggleModal();
  }
  //#endregion

  //#region Private methods
  //#endregion
}
