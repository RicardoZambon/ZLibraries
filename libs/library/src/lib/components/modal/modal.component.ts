import { NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, inject, Input } from '@angular/core';
import { IModal } from '../../models';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'lib-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  host: {
    'title': '', // This is to ensure that the title input does not conflict with the native HTML title attribute.
    '[class.show]': 'isShown',
  },
  imports: [
    NgIf,
  ]
})
export class ModalComponent extends BaseComponent implements IModal {
  //#region ViewChilds, Inputs, Outputs
  @Input() public closeButtonText: string = 'Close';
  @Input() public dialog: boolean = true;
  @Input() public modalProcessing: boolean = false;
  @Input() public position: 'top' | 'left' | 'right' | 'bottom' | 'center' = 'center';
  @Input() public size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'auto' = 'auto';
  @Input() public title!: string;
  //#endregion

  //#region Variables
  private _show: boolean = false;
  private clickedOutside: boolean = false;
  private elementRef: ElementRef
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
    const body: HTMLBodyElement | null = document.querySelector('body');
    body?.classList.toggle('modal-active');
    
    this._show = body?.classList.contains('modal-active') ?? false;

    if (this.isShown) {
      this.clickedOutside = false;

      const autofocus: any = this.elementRef.nativeElement.querySelector('[autofocus]')
      if (autofocus && !!autofocus.focus) {
        autofocus.focus();
      }
    }
  }
  //#endregion

  //#region Private methods
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  private bodyMouseDown(event: MouseEvent): void {
    if (this.dialog && this.isShown) {
      const target: HTMLElement = <HTMLElement>event.target;

      this.clickedOutside = (!this.modalProcessing && event.button === 0 && target.closest('lib-modal') && !target.closest('.modal-content')) ?? false;
    }
  }

  @HostListener('body:mouseup', ['$event'])
  private bodyMouseUp(event: MouseEvent): void {
    if (this.dialog && this.isShown) {      
      if (this.clickedOutside && !this.modalProcessing) {
        this.toggleModal();
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  private documentKeyDown(event: KeyboardEvent): void {
    event = event || window.event;

    let isEscape = false;
    if ('key' in event) {
      isEscape = (event.key === 'Escape' || event.key === 'Esc');
    } else {
      isEscape = ((<KeyboardEvent>event).keyCode === 27);
    }

    if (!this.modalProcessing && this.isShown && isEscape && document.body.classList.contains('modal-active')) {
      this.toggleModal();
    }
  }
  //#endregion
}