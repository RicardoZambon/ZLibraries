import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a numeric enum value into the name of its member, e.g. `{{ status | enumLabel: Status }}`.
 * Returns an empty string when the value or the enum is missing, or the value is not in the enum.
 */
@Pipe({
  name: 'enumLabel',
})
export class EnumLabelPipe implements PipeTransform {
  public transform(value?: number, enumType?: any): string {
    if (value === undefined || enumType === undefined) {
      return '';
    }

    const keys: string[] = Object.keys(enumType).filter((key: string) => !isNaN(Number(enumType[key])));
    const values: number[] = keys.map((key: string) => enumType[key]);

    const index: number = values.indexOf(value);
    if (index >= 0) {
      return keys[index];
    }
    return '';
  }
}
