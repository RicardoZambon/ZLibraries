import { Component, ViewContainerRef, viewChild } from '@angular/core';

/**
 * A host that behaves exactly like a consumer application's own component: it declares no
 * change-detection strategy, which in Angular 22 means `OnPush`. Once it has rendered it goes
 * clean, and a top-down pass skips it -- `detectChangesInView` only refreshes a view in Global
 * mode when it is `CheckAlways`, which an `OnPush` view never is, and then descends in Targeted
 * mode where nothing below is reached either unless the path was marked.
 *
 * That is what makes it an oracle. A component that mutates state without telling Angular
 * cannot update its DOM underneath this host, which is precisely the failure that a plain
 * `TestBed.createComponent` + `fixture.detectChanges()` cannot express.
 */
@Component({
  selector: 'lib-inert-host',
  template: '<ng-container #outlet />',
})
export class InertHostComponent {
  //#region ViewChilds, Inputs, Outputs
  public readonly outlet = viewChild.required('outlet', { read: ViewContainerRef });
  //#endregion
}
