import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {
  
  //#region ViewChilds, Inputs, Outputs
  //#endregion

  //#region Variables
  //#endregion

  //#region Properties
  //#endregion
  
  //#region Constructor and Angular life cycle methods
  //#endregion

  //#region Event handlers
  //#endregion

  //#region Public methods
  public transform(message: string, searchValue: string, replaceValue?: string | null): string {
    return message.replace(searchValue, replaceValue ?? '');
  }
  //#endregion

  //#region Private methods
  //#endregion
}