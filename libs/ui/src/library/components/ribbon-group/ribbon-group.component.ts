import { Component, computed, contentChildren, Input, Signal } from '@angular/core';

import { RibbonGroupChild } from '../../models/ribbon-group-child';

/**
 * A labelled group of buttons inside a `lib-ribbon`. The group hides itself when it holds no
 * visible `RibbonGroupChild`, such as the framework ribbon buttons. A plain `lib-ribbon-button` is
 * not one, so a group holding only those stays hidden.
 */
@Component({
  selector: 'lib-ribbon-group',
  templateUrl: './ribbon-group.component.html',
  styleUrls: ['./ribbon-group.component.scss'],
  host: { '[class.hidden]': '!hasChildren()' },
})
export class RibbonGroupComponent {
  //#region ViewChilds, Inputs, Outputs
  // A signal query, so a child arriving or leaving re-runs `hasChildren` on its own.
  /** The `RibbonGroupChild` elements projected into the group, at any depth. */
  public readonly children: Signal<readonly RibbonGroupChild[]> = contentChildren(RibbonGroupChild, {
    descendants: true,
  });

  /** Caption shown under the group's buttons. Shown as given, not translated. Defaults to empty. */
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
