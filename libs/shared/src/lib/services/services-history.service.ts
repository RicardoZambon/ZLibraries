import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@framework';
import { IListParameters } from '@library';
import { Observable } from 'rxjs';
import { IServicesHistoryList } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ServicesHistoryService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private http: HttpClient,
  ) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public list(controllerName: string, entityID: number, parameters: IListParameters): Observable<IServicesHistoryList[]> {
    return this.http.post<IServicesHistoryList[]>(`${this.config.BASE_URL}/${controllerName}/${entityID}/Audit`, parameters);
  }
  //#endregion

  //#region Private methods
  //#endregion
}