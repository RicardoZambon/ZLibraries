import { AfterViewInit, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { TabViewService } from '../services';
import { ViewBase } from './view-base';

@Component({ template: '' })
export abstract class TabViewBase extends ViewBase implements AfterViewInit {
    //#region ViewChilds, Inputs, Outputs
    @ViewChild('ribbon') private ribbonTemplate?: TemplateRef<any>;
    //#endregion
  
    //#region Variables
    private tabViewService: TabViewService | null;
    //#endregion
  
    //#region Properties
    //#endregion
  
    //#region Constructor and Angular life cycle methods
    constructor() {
      super();

      // This will force the screen to initialize with the buttons disabled.
      this.loading = true;
      this.tabViewService = inject(TabViewService, { optional: true });
    }

    public ngAfterViewInit(): void {
      this.tabViewService?.updateRibbonTemplate(this.ribbonTemplate);
    }
    //#endregion
  
    //#region Event handlers
    //#endregion
  
    //#region Public methods
    //#endregion
  
    //#region Private methods
    //#endregion
}