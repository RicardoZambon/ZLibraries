/**
 * @jest-environment <rootDir>/jest.time-zone-environment.cjs
 */
import { UtcDatePipe } from './utc-date.pipe';

// Provided by the environment above, which explains why a spec cannot change the zone by itself.
declare function setTimeZone(timeZone: string): void;

describe('UtcDatePipe', () => {
  let pipe: UtcDatePipe;

  beforeEach(() => {
    pipe = new UtcDatePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return null for undefined input', () => {
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should return null for falsy input', () => {
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should return null for a value that is not a date', () => {
    expect(pipe.transform('not a date')).toBeNull();
  });

  it('should return a Date object for valid input', () => {
    const date: Date = new Date(2026, 5, 15, 12, 30, 0);
    const result: Date | null = pipe.transform(date);
    expect(result).toBeInstanceOf(Date);
  });

  it('should not modify the original date', () => {
    const date: Date = new Date(2026, 5, 15, 12, 30, 0);
    const originalTime: number = date.getTime();
    pipe.transform(date);
    expect(date.getTime()).toBe(originalTime);
  });

  it('should preserve minutes and seconds', () => {
    const date: Date = new Date(2026, 5, 15, 12, 45, 30);
    const result: Date | null = pipe.transform(date);
    expect(result!.getMinutes()).toBe(45);
    expect(result!.getSeconds()).toBe(30);
  });

  // The pipe re-reads wall-clock fields as UTC, so what it shifts by is the zone's offset -- and
  // under UTC, the zone CI runs in, that offset is zero and a wrong implementation passes. The
  // conversion is therefore asserted in real zones on either side of Greenwich. East is where the
  // hour arithmetic this replaced kept the time of day but lost a day.
  describe.each<[string, number]>([
    ['America/Sao_Paulo', -180],
    ['Asia/Tokyo', 540],
  ])('in %s', (timeZone: string, offsetInMinutes: number) => {
    beforeAll(() => setTimeZone(timeZone));

    it('should run in that zone', () => {
      // Guards the cases below: had the zone not changed, they would run in the runner's zone and
      // prove nothing.
      expect(-new Date(2026, 5, 15).getTimezoneOffset()).toBe(offsetInMinutes);
    });

    it('should read the wall-clock fields of a date as UTC', () => {
      const date: Date = new Date(2026, 5, 15, 14, 30, 45);
      expect(pipe.transform(date)?.toISOString()).toBe('2026-06-15T14:30:45.000Z');
    });

    it('should keep the day for a time late in the UTC day', () => {
      const date: Date = new Date(2026, 5, 15, 23, 30, 0);
      expect(pipe.transform(date)?.toISOString()).toBe('2026-06-15T23:30:00.000Z');
    });

    it('should keep the day for a time early in the UTC day', () => {
      const date: Date = new Date(2026, 5, 15, 0, 30, 0);
      expect(pipe.transform(date)?.toISOString()).toBe('2026-06-15T00:30:00.000Z');
    });

    it('should read a string without a timezone marker as UTC', () => {
      expect(pipe.transform('2026-06-15T23:30:00')?.toISOString()).toBe('2026-06-15T23:30:00.000Z');
    });

    it('should not shift a string that already declares UTC', () => {
      expect(pipe.transform('2026-06-15T23:30:00Z')?.toISOString()).toBe('2026-06-15T23:30:00.000Z');
    });

    it('should not shift a string that declares its offset', () => {
      expect(pipe.transform('2026-06-15T23:30:00-03:00')?.toISOString()).toBe('2026-06-16T02:30:00.000Z');
    });
  });
});
