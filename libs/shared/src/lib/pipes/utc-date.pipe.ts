import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcDate'
})
export class UtcDatePipe implements PipeTransform {
  transform(value?: Date): Date | null {
    if (!value) {
      return null;
    }

    const newDate: Date = new Date(value);

    let utcHour: number = newDate.getUTCHours();
    if (utcHour < newDate.getHours()) {
      utcHour += 24;
    }

    newDate.setHours(
      newDate.getHours() + newDate.getHours() - utcHour,
      newDate.getMinutes(),
      newDate.getSeconds()
    );

    return newDate;
  }
}