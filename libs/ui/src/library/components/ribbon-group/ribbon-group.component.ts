import { Component, computed, contentChildren, Input, Signal } from '@angular/core';

import { RibbonGroupChild } from '../../models/ribbon-group-child';

@Component({
  selector: 'lib-ribbon-group',
  templateUrl: './ribbon-group.component.html',
  styleUrls: ['./ribbon-group.component.scss'],
  host: { '[class.hidden]': '!hasChildren()' },
})
export class RibbonGroupComponent {
  //#region ViewChilds, Inputs, Outputs
  // A signal query, so a child arriving or leaving re-runs `hasChildren` on its own.
  public readonly children: Signal<readonly RibbonGroupChild[]> = contentChildren(RibbonGroupChild, {
    descendants: true,
  });

  @Input() public label = '';
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected readonly hasChildren: Signal<boolean> = computed(() =>
    this.children().some((child: RibbonGroupChild) => child.isVisible()),
  );
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
