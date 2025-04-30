import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ITab } from '../../../models';
import { TabService } from '../../../services';

@Component({
  selector: 'framework-tab-breadcrumbs',
  templateUrl: './tab-breadcrumbs.component.html',
  styleUrls: ['./tab-breadcrumbs.component.scss'],
  imports: [
    NgFor,
    TranslatePipe,
  ]
})
export class TabBreadcrumbsComponent {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Host listeners
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  protected get tabHistory(): ITab[] {
    return this.tabService.activeTabHistory;
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private tabService: TabService) {

  }
  //#endregion

  //#region Event handlers
  protected onTitleClick(tab: ITab): void {
    this.tabService.navigateCurrentTabBack(tab);
  }
  //#endregion

  //#region Public methods
  //#endregion

  //#region Private methods
  //#endregion
}