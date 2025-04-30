import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumText'
})
export class EnumTextPipe implements PipeTransform {
  transform(value?: number, enumType?: any): string {
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