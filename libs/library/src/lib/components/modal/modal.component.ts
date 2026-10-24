import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { IModal, ModalSize } from '../../models';
import { BaseComponent } from '../base.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'lib-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  host: {
    title: '', // This is to ensure that the title input does not conflict with the native HTML title attribute.
    '[class.show]': 'isOpen()',
  },
  imports: [ButtonComponent],
})
export class ModalComponent extends BaseComponent implements IModal, OnInit {
  //#region ViewChilds, Inputs, Outputs
  public readonly closeButtonText: ModelSignal<string> = model('Close');
  public readonly dialog: InputSignal<boolean> = input(true);
  public readonly modalProcessing: ModelSignal<boolean> = model(false);
  public readonly position: InputSignal<'top' | 'left' | 'right' | 'bottom' | 'center'> = input<
    'top' | 'left' | 'right' | 'bottom' | 'center'
  >('center');
  public readonly size: InputSignal<ModalSize> = input<ModalSize>('auto');
  public readonly title: InputSignal<string | undefined> = input<string>();

  public readonly closed: OutputEmitterRef<void> = output<void>();
  //#endregion

  //#region Variables
  private readonly _isOpen: WritableSignal<boolean> = signal(false);
  private clickedOutside = false;
  private elementRef: ElementRef;
  //#endregion

  //#region Properties
  /** Renamed from `isShown`, and a signal now -- IModal says why. */
  public readonly isOpen: Signal<boolean> = this._isOpen.asReadonly();
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor() {
    super();

    this.elementRef = inject(ElementRef);
  }

  /**
   * Moves the host to `<body>`.
   *
   * The host is `fixed` at `z-index: 50`, which ought to put it over everything. It did not: a
   * modal opened from a view rendered *under* the navigation, and the tab strip stayed visible and
   * clickable behind it. z-index only ranks siblings inside one stacking context, and the panel
   * these views render in is its own — it has to be, so the glass layer behind it can sit at -1
   * without falling through the app backdrop. Inside that context the modal's 50 counts for
   * nothing against the sidebar's 20 outside it, and it can never reach over the strip either.
   *
   * A bigger number cannot fix that, and dropping the isolation breaks the glass. Leaving the
   * context is the fix, and the body is the one place with nothing above it.
   *
   * Angular keeps rendering into this element wherever it sits, and injection does not care where
   * the node ends up — the forms and datasets these modals reach for still resolve through the
   * component tree.
   */
  public ngOnInit(): void {
    // Guarded because the logic specs build these components with Object.create() and never give
    // them a host; there is nothing to move then, and nothing to do.
    const host: HTMLElement | undefined = this.elementRef?.nativeElement;
    host?.ownerDocument.body.appendChild(host);
  }

  /** Angular drops the view but not the node, now that the host is no longer where it was created. */
  public override ngOnDestroy(): void {
    (<HTMLElement | undefined>this.elementRef?.nativeElement)?.remove();

    super.ngOnDestroy();
  }
  //#endregion

  //#region Event handlers
  protected onCloseClick(): void {
    if (!this.modalProcessing() && this.isOpen()) {
      this.closeModal();
    }
  }

  /**
   * Refuses the native submission of the form the content sits in.
   *
   * A submit button in here -- framework-button-filters' Confirm is one, and any <button> without a
   * type is another -- makes the browser submit this form once the button's own click handler has
   * run: a GET to the current URL, which reloads the whole application. Before the host moved to
   * <body> the submit bubbled through the consumer, and the FormGroupDirective of its [formGroup]
   * binding cancelled it; that was never this component's doing, and it stopped when the event
   * stopped passing through the consumer. A modal is never meant to submit natively, so the form
   * says so itself, wherever the host lives.
   *
   * Only the default is prevented. The event still bubbles, and the click that caused it has already
   * done its work.
   */
  protected onFormSubmit(event: Event): void {
    event.preventDefault();
  }
  //#endregion

  //#region Public methods
  public closeModal(): void {
    if (this.isOpen()) {
      this.toggleModal();
    }
  }

  public toggleModal(): void {
    const wasOpen: boolean = this._isOpen();

    const body: HTMLBodyElement | null = document.querySelector('body');
    body?.classList.toggle('modal-active');

    this._isOpen.set(body?.classList.contains('modal-active') ?? false);

    if (this.isOpen()) {
      this.clickedOutside = false;

      const autofocus: any = this.elementRef.nativeElement.querySelector('[autofocus]');
      if (autofocus && !!autofocus.focus) {
        autofocus.focus();
      }
    } else if (wasOpen) {
      this.closed.emit();
    }
  }
  //#endregion

  //#region Private methods
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  protected bodyMouseDown(event: MouseEvent): void {
    if (this.dialog() && this.isOpen()) {
      const target: HTMLElement = <HTMLElement>event.target;

      this.clickedOutside =
        (!this.modalProcessing() &&
          event.button === 0 &&
          target.closest('lib-modal') &&
          !target.closest('.modal-content')) ??
        false;
    }
  }

  @HostListener('body:mouseup', ['$event'])
  protected bodyMouseUp(event: MouseEvent): void {
    if (this.dialog() && this.isOpen()) {
      if (this.clickedOutside && !this.modalProcessing()) {
        this.toggleModal();
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected documentKeyDown(event: Event): void {
    event = event || window.event;

    // keyCode is the fallback for engines predating KeyboardEvent.key.
    const isEscape: boolean =
      'key' in event ? event.key === 'Escape' || event.key === 'Esc' : (<KeyboardEvent>event).keyCode === 27;

    if (!this.modalProcessing() && this.isOpen() && isEscape && document.body.classList.contains('modal-active')) {
      this.toggleModal();
    }
  }
  //#endregion
}
