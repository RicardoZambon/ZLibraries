import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Pipe({
  name: 'enumTranslate'
})
export class EnumTranslatePipe implements PipeTransform {
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  private translate: TranslateService = inject(TranslateService);
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructor and Angular life cycle methods
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