import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@zambon/framework';
import { IListParameters } from '@zambon/library';
import { Observable } from 'rxjs';
import { IServicesHistoryList } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ServicesHistoryService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private config: AppConfig = inject(APP_CONFIG);
  private http: HttpClient = inject(HttpClient);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
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