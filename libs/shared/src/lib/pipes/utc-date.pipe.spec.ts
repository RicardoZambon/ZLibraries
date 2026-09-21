import { UtcDatePipe } from './utc-date.pipe';

describe('UtcDatePipe', () => {
  let pipe: UtcDatePipe;

  beforeEach(() => {
    pipe = new UtcDatePipe();
  });

  afterEach(() => jest.restoreAllMocks());

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
    // The pipe reads getHours() and getUTCHours(); the gap between them IS the
    // offset it applies. Pinning getUTCHours pins the offset to UTC-3 on any
    // machine, so this asserts the direction of the shift rather than the
    // runner's timezone. Under a real TZ=UTC the shift is zero and an inverted
    // implementation would pass -- which is how the original bug survived.
    jest.spyOn(Date.prototype, 'getUTCHours').mockImplementation(function (this: Date): number {
      return this.getHours() + 3;
    });

    const date: Date = new Date(2026, 5, 15, 12, 0, 0);
    const result: Date | null = pipe.transform(date);

    expect(result).not.toBeNull();
    // 12:00 read as UTC is 09:00 for a viewer at UTC-3.
    expect(result!.getHours()).toBe(9);
  });

  it('should preserve minutes and seconds', () => {
    const date: Date = new Date(2026, 5, 15, 12, 45, 30);
    const result: Date | null = pipe.transform(date);
    expect(result!.getMinutes()).toBe(45);
    expect(result!.getSeconds()).toBe(30);
  });
});
