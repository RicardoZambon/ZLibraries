import { NgStyle } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-group-accordion',
  templateUrl: './group-accordion.component.html',
  styleUrls: ['./group-accordion.component.scss'],
  host: { '[class.collapsed]': 'collapsed' },
  imports: [
    NgStyle,
  ]
})
export class GroupAccordionComponent {
  //#region ViewChilds, Inputs, Outputs
  @ViewChild('container') private containerElementRef!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) label!: string;
  //#endregion

  //#region Variables
  private collapsed: boolean = false;
  private _maxHeight: number = -1;
  //#endregion

  //#region Properties
  public get maxHeight(): number {
    return this._maxHeight;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  protected onToggle(): void {
    // Before collapsing, we set the max height style for the closing effect.
    if (!this.collapsed) {
      this.setMaxHeight();
    }

    setTimeout(() => {
      this.collapsed = !this.collapsed;

      // After expanding, we wait the transition to end and remove the max height.
      if (!this.collapsed) {
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
      this._maxHeight = -1;
    }, 150);
  }
  private setMaxHeight(): void {
    this._maxHeight = this.containerElementRef?.nativeElement?.offsetHeight ?? 0;
  }
  //#endregion
}