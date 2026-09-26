import { FlexibleConnectedPositionStrategy, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, TranslatePipe],
})
export class RibbonButtonComponent implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('buttonContainer') private buttonContainer!: ElementRef<HTMLElement>;
  @ViewChild('optionsDropdown') private optionsDropdown?: TemplateRef<unknown>;

  @Input() public color = 'text-primary-500';
  @Input() public defaultOption = -1;
  @Input() public disabled = false;
  @Input() public icon?: string;
  @Input() public iconSize: 'small' | 'large' = 'large';
  @Input() public label = '';
  @Input() public loading = false;
  @Input() public options: IRibbonButtonOption[] = [];
  @Input() public tooltip = '';

  @Output() public action = new EventEmitter<string | undefined>();
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  protected bodyMouseDown(event: MouseEvent): void {
    if (this.showDropdown) {
      const target: HTMLElement = <HTMLElement>event.target;

      const button: HTMLElement | null | undefined = target.closest('.button-container')?.parentElement;

      this.clickedOutside =
        event.button === 0 &&
        !target.closest('.options-dropdown') &&
        (!button || (!button?.classList.contains('dropdown') && !button?.classList.contains('open')));
    }
  }

  @HostListener('body:mouseup', ['$event'])
  protected bodyMouseUp(event: MouseEvent): void {
    if (this.showDropdown && this.clickedOutside) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected documentKeyDown(event: Event): void {
    event = event || window.event;

    // keyCode is the fallback for engines predating KeyboardEvent.key.
    const isEscape: boolean =
      'key' in event ? event.key === 'Escape' || event.key === 'Esc' : (<KeyboardEvent>event).keyCode === 27;

    if (this.showDropdown && isEscape) {
      this.closeDropdown();
    }
  }
  //#endregion

  //#region Variables
  protected showDropdown = false;
  protected status: null | 'failure' | 'warning' | 'success' = null;

  private clickedOutside = false;
  private overlay: Overlay = inject(Overlay);
  private overlayRef?: OverlayRef;
  private positionBuilder: OverlayPositionBuilder = inject(OverlayPositionBuilder);
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
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
    return (
      this.disabled ||
      this.loading ||
      (this.options.length > 0 && !this.options.some((option: IRibbonButtonOption) => this.isOptionVisible(option)))
    );
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  public ngOnDestroy(): void {
    this.closeDropdown();
  }
  //#endregion

  //#region Event handlers
  protected onButtonClicked(): void {
    if (this.options.length > 0) {
      if (this.defaultOption >= 0 && this.defaultOption < this.options.length) {
        this.closeDropdown();
        this.action.emit(this.options[this.defaultOption].id);
      } else {
        this.onShowHideDropdown();
      }
    } else {
      this.action.emit();
    }
  }

  protected onOptionClicked(option: IRibbonButtonOption) {
    this.closeDropdown();
    this.action.emit(option.id);
  }

  protected onShowHideDropdown(): void {
    if (this.showDropdown) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
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
    return (
      (option.isVisible ?? true) &&
      (option.allowedActions === undefined ||
        option.allowedActions.length === 0 ||
        option.isAccessAllowed === true ||
        (option.isAccessAllowed == undefined && option.allowedActions?.length > 0))
    );
  }
  //#endregion

  //#region Private methods
  private closeDropdown(): void {
    this.showDropdown = false;

    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  /**
   * Opens the options list in an overlay attached to the document rather than inside this button.
   *
   * The list is absolutely positioned and used to live in the button's own subtree, which works
   * only while nothing between it and the page clips. `lib-data-grid` does: it is
   * `overflow: hidden`, its buttons bar is its first child, and a child list's grid is only a few
   * rows tall -- so the export button's options opened downwards into the grid and had their lower
   * part cut off. Measured in Storybook at 129px of list against 65px of room, 64px lost.
   *
   * Nothing smaller fixes it. The grid's clipping is load-bearing -- the rows scroll inside it and
   * its corners are rounded -- and no z-index lifts content out of an ancestor's overflow. Leaving
   * the subtree is the fix, and it is what `lib-catalog-select` already does for its own dropdown.
   *
   * `reposition()` rather than `close()`: the button can move while the list is open, and the list
   * should follow it rather than disappear.
   */
  private openDropdown(): void {
    if (!this.optionsDropdown) {
      return;
    }

    this.closeDropdown();

    const positionStrategy: FlexibleConnectedPositionStrategy = this.positionBuilder
      .flexibleConnectedTo(this.buttonContainer)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef.attach(new TemplatePortal(this.optionsDropdown, this.viewContainerRef));
    this.showDropdown = true;
  }
  //#endregion
}
