import { Component, ContentChildren, Input, QueryList } from '@angular/core';

import { RibbonGroupChild } from '../../models/ribbon-group-child';

@Component({
  selector: 'lib-ribbon-group',
  templateUrl: './ribbon-group.component.html',
  styleUrls: ['./ribbon-group.component.scss'],
  host: { '[class.hidden]': '!hasChildren' }
})
export class RibbonGroupComponent {
  //#region ViewChilds, Inputs, Outputs
  @ContentChildren(RibbonGroupChild, { descendants: true }) public children?: QueryList<RibbonGroupChild>;

  @Input() public label: string = '';
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get hasChildren(): boolean {
    return this.children?.some(x => x.visible) ?? false;
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