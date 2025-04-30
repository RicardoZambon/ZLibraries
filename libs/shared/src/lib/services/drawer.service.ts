import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@framework';
import { INavigationItem } from '@library';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private readonly BASE_URL: string;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private http: HttpClient,
  ) {
    this.BASE_URL = `${this.config.BASE_URL}/Menus`;
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public getItem(url: string): Observable<INavigationItem> {
    return this.http.get<INavigationItem>(`${this.BASE_URL}/GetItem`, { params: { url } });
  }
  //#endregion

  //#region Private methods
  //#endregion
}