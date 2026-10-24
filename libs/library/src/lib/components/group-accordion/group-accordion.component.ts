import { NgStyle } from '@angular/common';
import { Component, ElementRef, input, InputSignal, Signal, signal, viewChild, WritableSignal } from '@angular/core';

@Component({
  selector: 'lib-group-accordion',
  templateUrl: './group-accordion.component.html',
  styleUrls: ['./group-accordion.component.scss'],
  host: { '[class.collapsed]': 'collapsed()' },
  imports: [NgStyle],
})
export class GroupAccordionComponent {
  //#region ViewChilds, Inputs, Outputs
  private readonly containerElementRef: Signal<ElementRef<HTMLDivElement> | undefined> =
    viewChild<ElementRef<HTMLDivElement>>('container');

  public readonly label: InputSignal<string> = input.required<string>();
  //#endregion

  //#region Variables
  private readonly _maxHeight: WritableSignal<number> = signal(-1);
  protected readonly collapsed: WritableSignal<boolean> = signal(false);
  //#endregion

  //#region Properties
  public readonly maxHeight: Signal<number> = this._maxHeight.asReadonly();
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onToggle(): void {
    // Before collapsing, we set the max height style for the closing effect.
    if (!this.collapsed()) {
      this.setMaxHeight();
    }

    setTimeout(() => {
      this.collapsed.update((collapsed: boolean) => !collapsed);

      // After expanding, we wait the transition to end and remove the max height.
      if (!this.collapsed()) {
        this.clearMaxHeight();
      }
    });
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  private clearMaxHeight(): void {
    setTimeout(() => {
      this._maxHeight.set(-1);
    }, 150);
  }
  private setMaxHeight(): void {
    this._maxHeight.set(this.containerElementRef()?.nativeElement?.offsetHeight ?? 0);
  }
  //#endregion
}
