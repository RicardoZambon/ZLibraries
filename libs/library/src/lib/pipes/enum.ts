import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'enum'
})
export class EnumPipe implements PipeTransform {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  constructor(private translate: TranslateService) {
  }
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public transform(enumType: any): Array<{value: any, display: Observable<any> }> {
    return Object.keys(enumType)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      value: enumType[key],
      display: this.translate.get(key),
    }));
  }
  //#endregion

  //#region Private methods
  //#endregion
}