import { Pipe, PipeTransform } from '@angular/core';

/**
 * Replaces several placeholders in a string, for example
 * `'Hello {name}' | replaceMany: { '{name}': user.name }`. Only the first occurrence of each key
 * is replaced; a `null` or `undefined` value becomes an empty string.
 */
@Pipe({
  name: 'replaceMany',
})
export class ReplaceManyPipe implements PipeTransform {
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
  public transform(message: string, replaceArgs?: { [id: string]: string | null | undefined }): string {
    if (replaceArgs) {
      for (const [key, value] of Object.entries(replaceArgs)) {
        message = message.replace(key, value ?? '');
      }
    }
    return message;
  }
  //#endregion

  //#region Private methods
  //#endregion
}
