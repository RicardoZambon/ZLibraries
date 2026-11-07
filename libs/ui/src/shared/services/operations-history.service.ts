import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@zambon-dev/ui/framework';
import { IListParameters } from '@zambon-dev/ui/library';
import { Observable } from 'rxjs';
import { IOperationsHistoryList } from '../models';

/** Loads the field-level operations of one change set from the audit API. */
@Injectable({
  providedIn: 'root',
})
export class OperationsHistoryService {
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
  /**
   * Lists the operations of change set `serviceHistoryID` on the record `entityID` under the API
   * controller `controllerName`, filtered and paged by `parameters`.
   */
  public list(
    controllerName: string,
    entityID: number,
    serviceHistoryID: number,
    parameters: IListParameters,
  ): Observable<IOperationsHistoryList[]> {
    return this.http.post<IOperationsHistoryList[]>(
      `${this.config.BASE_URL}/${controllerName}/${entityID}/Audit/${serviceHistoryID}`,
      parameters,
    );
  }
  //#endregion

  //#region Private methods
  //#endregion
}
