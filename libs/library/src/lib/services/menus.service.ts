import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { INavigationItem } from '../models/navigation-item';

@Injectable({
  providedIn: 'root'
})
export class MenuEntriesService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private http: HttpClient) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public list(endpoint: string, parentMenuId: number | null = null): Observable<INavigationItem[]> {
    if (parentMenuId !== null) {
      endpoint += `/${parentMenuId}`;
    }
    return this.http.post<INavigationItem[]>(endpoint, { });
  }
  //#endregion

  //#region Private methods
  //#endregion
}