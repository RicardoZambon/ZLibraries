import { Pipe, PipeTransform } from '@angular/core';

/**
 * Replaces one substring in a string, for example `label | replace: '{0}': count`. Only the first
 * occurrence is replaced; a `null` or `undefined` replacement becomes an empty string.
 */
@Pipe({
  name: 'replace',
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
