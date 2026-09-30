import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcDate'
})
export class UtcDatePipe implements PipeTransform {
  private static readonly timeZoneMarker: RegExp = /(?:Z|[+-]\d{2}:?\d{2})$/i;

  transform(value?: Date | string): Date | null {
    if (!value) {
      return null;
    }

    const newDate: Date = new Date(value);
    if (Number.isNaN(newDate.getTime())) {
      return null;
    }

    // A value that declares its zone has already been parsed as the right instant.
    if (
      typeof value === 'string' &&
      UtcDatePipe.timeZoneMarker.test(value.trim())
    ) {
      return newDate;
    }

    // The API serializes UTC values without a timezone marker, so Date parses them as local time.
    // Shifting by the offset re-reads those parts as UTC, which keeps both the time and the day
    // correct on either side of Greenwich.
    return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000);
  }
}
