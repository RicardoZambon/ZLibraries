import { Injectable, TemplateRef } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable()
export class TabViewService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  public onUpdateRibbonTemplate: ReplaySubject<TemplateRef<any> | undefined> = new ReplaySubject<TemplateRef<any> | undefined>(1);
  public onViewChanged: Subject<string> = new Subject<string>();

  private _activeView?: string;
  //#endregion

  //#region Properties
  public get activeView(): string {
    return this._activeView ?? '';
  }
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor() {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public setActiveView(viewId: string): void {
    if (viewId === this._activeView) {
      return;
    }
    
    this._activeView = viewId;
    this.onViewChanged.next(viewId);
  }

  public updateRibbonTemplate(template: TemplateRef<any>| undefined): void {
    this.onUpdateRibbonTemplate.next(template);
  }
  //#endregion

  //#region Private methods
  //#endregion
}