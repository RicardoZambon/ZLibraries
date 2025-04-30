import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ICatalogResult } from '../models/catalog-result';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
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
  public search(endpoint: string, maxResults: number, criteria?: string, filters: { [key: string ] : string } | null = null): Observable<ICatalogResult> {
    return this.http.post<ICatalogResult>(`${endpoint}`, { maxResults, criteria, filters });
  }
  //#endregion

  //#region Private methods
  //#endregion
}