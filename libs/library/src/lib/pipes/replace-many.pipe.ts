import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceMany'
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