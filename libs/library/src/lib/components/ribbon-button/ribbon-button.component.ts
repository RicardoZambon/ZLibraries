import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IRibbonButtonOption } from '../../models/ribbon-button-option';

@Component({
  selector: 'lib-ribbon-button',
  templateUrl: './ribbon-button.component.html',
  host: {
    '[class.dropdown]': 'options.length > 0',
    '[class.show]': 'showDropdown',
  },
  styleUrls: ['./ribbon-button.component.scss'],
  imports: [
    NgClass,
    NgFor,
    NgIf,
    TranslatePipe,
  ]
})
export class RibbonButtonComponent {
  //#region ViewChilds, Inputs, Outputs
  @Input() public color: string = 'text-primary-500';
  @Input() public defaultOption: number = -1;
  @Input() public disabled: boolean = false;
  @Input() public icon?: string;
  @Input() public iconSize: 'small' | 'large' = 'large';
  @Input() public label: string = '';
  @Input() public loading: boolean = false;
  @Input() public options: IRibbonButtonOption[] = [];

  @Output() public action = new EventEmitter<string | undefined>();
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  private bodyMouseDown(event: MouseEvent): void {
    if (this.showDropdown) {
      const target: HTMLElement = <HTMLElement>event.target;

      const button: HTMLElement | null | undefined = target.closest('.button-container')?.parentElement;

      this.clickedOutside =
        event.button === 0
        && !target.closest('.options-dropdown')
        && (
          !button || (!button?.classList.contains('dropdown') && !button?.classList.contains('open'))
        );
    }
  }

  @HostListener('body:mouseup', ['$event'])
  private bodyMouseUp(event: MouseEvent): void {
    if (this.showDropdown && this.clickedOutside) {
      this.showDropdown = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  private documentKeyDown(event: KeyboardEvent): void {
    event = event || window.event;
    
    let isEscape: boolean = false;
    if ('key' in event) {
      isEscape = (event.key === 'Escape' || event.key === 'Esc');
    } else {
      isEscape = ((<KeyboardEvent>event).keyCode === 27);
    }

    if (this.showDropdown && isEscape) {
      this.showDropdown = false;
    }
  }
  //#endregion

  //#region Variables
  protected showDropdown: boolean = false;
  protected status: null | 'failure' | 'warning' | 'success' = null;

  private clickedOutside: boolean = false;
  //#endregion

  //#region Properties
  protected get buttonIcon(): string {
    switch (this.status) {
      case 'success':
        return 'fa-check';
      case 'failure':
        return 'fa-times';
      case 'warning':
        return 'fa-exclamation';
      default:
        return this.icon ?? '';
    }
  }

  protected get isButtonDisabled(): boolean {
    return this.disabled || this.loading || (this.options.length > 0 && !this.options.some((option: IRibbonButtonOption) => this.isOptionVisible(option)));
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    if (this.options.length > 0) {
      if (this.defaultOption >= 0 && this.defaultOption < this.options.length) {
        this.action.emit(this.options[this.defaultOption].id);
      } else {
        this.onShowHideDropdown();
      }
    } else {
      this.action.emit();
    }
  }

  protected onOptionClicked(option: IRibbonButtonOption) {
    this.showDropdown = false;
    this.action.emit(option.id);
  }

  protected onShowHideDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
  //#endregion

  //#region Public methods
  public finishLoading(status: 'failure' | 'warning' | 'success'): void {
    this.loading = false;
    this.status = status;

    setTimeout(() => {
      this.status = null;
    }, 1000);
  }

  public startLoading(): void {
    this.loading = true;
  }

  protected isOptionDisabled(option: IRibbonButtonOption): boolean {
    return option.isDisabled || ((option.allowedActions?.length ?? 0) > 0 && option.isAccessAllowed === undefined);
  }

  protected isOptionVisible(option: IRibbonButtonOption): boolean {
    return (option.isVisible ?? true) && (option.allowedActions === undefined || option.allowedActions.length === 0 || option.isAccessAllowed === true || (option.isAccessAllowed == undefined && option.allowedActions?.length > 0));
  }
  //#endregion

  //#region Private methods
  //#endregion
}