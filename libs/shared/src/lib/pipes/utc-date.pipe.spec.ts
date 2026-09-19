import { UtcDatePipe } from './utc-date.pipe';

// Pinned to a fixed, DST-free UTC-3 zone. The pipe's whole point is a timezone
// shift, so under TZ=UTC the shift is zero and the assertions below cannot fail
// — which is exactly how an inverted expectation survived here unnoticed.
process.env.TZ = 'Etc/GMT+3';

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

  it('should re-express UTC wall-clock fields in local time', () => {
    // A value whose fields carry a UTC time but which was parsed as local:
    // 12:00 "UTC" is 09:00 for a viewer at UTC-3.
    const date: Date = new Date(2026, 5, 15, 12, 0, 0);
    const result: Date | null = pipe.transform(date);

    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(9);
    expect(result!.getHours()).toBe(new Date(Date.UTC(2026, 5, 15, 12, 0, 0)).getHours());
  });

  it('should preserve minutes and seconds', () => {
    const date: Date = new Date(2026, 5, 15, 12, 45, 30);
    const result: Date | null = pipe.transform(date);
    expect(result!.getMinutes()).toBe(45);
    expect(result!.getSeconds()).toBe(30);
  });
});
