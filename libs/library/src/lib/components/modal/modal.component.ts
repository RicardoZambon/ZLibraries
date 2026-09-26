import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IModal } from '../../models';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  host: {
    title: '', // This is to ensure that the title input does not conflict with the native HTML title attribute.
    '[class.show]': 'isShown',
  },
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [],
})
export class ModalComponent extends BaseComponent implements IModal, OnInit {
  //#region ViewChilds, Inputs, Outputs
  @Input() public closeButtonText = 'Close';
  @Input() public dialog = true;
  @Input() public modalProcessing = false;
  @Input() public position: 'top' | 'left' | 'right' | 'bottom' | 'center' = 'center';
  @Input() public size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto' =
    'auto';
  @Input() public title!: string;

  @Output() public closed: EventEmitter<void> = new EventEmitter<void>();
  //#endregion

  //#region Variables
  private _show = false;
  private clickedOutside = false;
  private elementRef: ElementRef;
  //#endregion

  //#region Properties
  public get isShown(): boolean {
    return this._show;
  }
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
    if (!this.modalProcessing && this.isShown) {
      this.closeModal();
    }
  }
  //#endregion

  //#region Public methods
  public closeModal(): void {
    if (this.isShown) {
      this.toggleModal();
    }
  }

  public toggleModal(): void {
    const wasShown: boolean = this._show;

    const body: HTMLBodyElement | null = document.querySelector('body');
    body?.classList.toggle('modal-active');

    this._show = body?.classList.contains('modal-active') ?? false;

    if (this.isShown) {
      this.clickedOutside = false;

      const autofocus: any = this.elementRef.nativeElement.querySelector('[autofocus]');
      if (autofocus && !!autofocus.focus) {
        autofocus.focus();
      }
    } else if (wasShown) {
      this.closed.emit();
    }
  }
  //#endregion

  //#region Private methods
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  protected bodyMouseDown(event: MouseEvent): void {
    if (this.dialog && this.isShown) {
      const target: HTMLElement = <HTMLElement>event.target;

      this.clickedOutside =
        (!this.modalProcessing &&
          event.button === 0 &&
          target.closest('lib-modal') &&
          !target.closest('.modal-content')) ??
        false;
    }
  }

  @HostListener('body:mouseup', ['$event'])
  protected bodyMouseUp(event: MouseEvent): void {
    if (this.dialog && this.isShown) {
      if (this.clickedOutside && !this.modalProcessing) {
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

    if (!this.modalProcessing && this.isShown && isEscape && document.body.classList.contains('modal-active')) {
      this.toggleModal();
    }
  }
  //#endregion
}
