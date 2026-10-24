import { FlexibleConnectedPositionStrategy, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnDestroy,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IRibbonButtonOption } from '../../models/ribbon-button-option';

@Component({
  selector: 'lib-ribbon-button',
  templateUrl: './ribbon-button.component.html',
  host: {
    '[class.dropdown]': 'options().length > 0',
    '[class.show]': 'showDropdown()',
  },
  styleUrls: ['./ribbon-button.component.scss'],
  imports: [NgClass, TranslatePipe],
})
export class RibbonButtonComponent implements OnDestroy {
  //#region ViewChilds, Inputs, Outputs
  private readonly buttonContainer: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('buttonContainer');
  private readonly optionsDropdown: Signal<TemplateRef<unknown> | undefined> =
    viewChild<TemplateRef<unknown>>('optionsDropdown');

  public readonly color: InputSignal<string> = input('text-primary-500');
  public readonly defaultOption: InputSignal<number> = input(-1);
  public readonly disabled: InputSignal<boolean> = input(false);
  public readonly icon: InputSignal<string | undefined> = input<string>();
  public readonly iconSize: InputSignal<'small' | 'large'> = input<'small' | 'large'>('large');
  public readonly label: InputSignal<string> = input('');
  public readonly loading: ModelSignal<boolean> = model(false);
  public readonly options: InputSignal<IRibbonButtonOption[]> = input<IRibbonButtonOption[]>([]);
  public readonly tooltip: InputSignal<string> = input('');

  public readonly action: OutputEmitterRef<string | undefined> = output<string | undefined>();
  //#endregion

  //#region Host listeners
  @HostListener('body:mousedown', ['$event'])
  protected bodyMouseDown(event: MouseEvent): void {
    if (this.showDropdown()) {
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
    if (this.showDropdown() && this.clickedOutside) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected documentKeyDown(event: Event): void {
    event = event || window.event;

    // keyCode is the fallback for engines predating KeyboardEvent.key.
    const isEscape: boolean =
      'key' in event ? event.key === 'Escape' || event.key === 'Esc' : (<KeyboardEvent>event).keyCode === 27;

    if (this.showDropdown() && isEscape) {
      this.closeDropdown();
    }
  }
  //#endregion

  //#region Variables
  protected readonly showDropdown: WritableSignal<boolean> = signal(false);
  protected readonly status: WritableSignal<null | 'failure' | 'warning' | 'success'> = signal(null);

  private clickedOutside = false;
  private overlay: Overlay = inject(Overlay);
  private overlayRef?: OverlayRef;
  private positionBuilder: OverlayPositionBuilder = inject(OverlayPositionBuilder);
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  //#endregion

  //#region Properties
  protected get buttonIcon(): string {
    switch (this.status()) {
      case 'success':
        return 'fa-check';
      case 'failure':
        return 'fa-times';
      case 'warning':
        return 'fa-exclamation';
      default:
        return this.icon() ?? '';
    }
  }

  protected get isButtonDisabled(): boolean {
    return (
      this.disabled() ||
      this.loading() ||
      (this.options().length > 0 && !this.options().some((option: IRibbonButtonOption) => this.isOptionVisible(option)))
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
    if (this.options().length > 0) {
      if (this.defaultOption() >= 0 && this.defaultOption() < this.options().length) {
        this.closeDropdown();
        this.action.emit(this.options()[this.defaultOption()].id);
      } else {
        this.onShowHideDropdown();
      }
    } else {
      this.action.emit(undefined);
    }
  }

  protected onOptionClicked(option: IRibbonButtonOption) {
    this.closeDropdown();
    this.action.emit(option.id);
  }

  protected onShowHideDropdown(): void {
    if (this.showDropdown()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }
  //#endregion

  //#region Public methods
  public finishLoading(status: 'failure' | 'warning' | 'success'): void {
    this.loading.set(false);
    this.status.set(status);

    setTimeout(() => {
      this.status.set(null);
    }, 1000);
  }

  public startLoading(): void {
    this.loading.set(true);
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
    this.showDropdown.set(false);

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
    if (!this.optionsDropdown()) {
      return;
    }

    this.closeDropdown();

    const positionStrategy: FlexibleConnectedPositionStrategy = this.positionBuilder
      .flexibleConnectedTo(this.buttonContainer()!)
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

    this.overlayRef.attach(new TemplatePortal(this.optionsDropdown()!, this.viewContainerRef));
    this.showDropdown.set(true);
  }
  //#endregion
}
