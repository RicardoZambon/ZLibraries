import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'lib-form-group',
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  imports: [
    NgIf,
    TranslatePipe,
  ],
  host: {
    '[class.expand]': 'shouldExpand'
  }
})
export class FormGroupComponent {
  //#region ViewChilds, Inputs, Outputs
  @Input() public shouldExpand: boolean = false;
  @Input() public label!: string;
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get hasTitle(): boolean {
    return !!this.label;
  }
  //#endregion

  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}