import { UtcDatePipe } from './utc-date.pipe';

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

  it('should adjust hours based on UTC offset', () => {
    const date: Date = new Date(2026, 5, 15, 12, 0, 0);
    const result: Date | null = pipe.transform(date);
    expect(result).not.toBeNull();
    // The pipe adjusts by local-UTC offset difference
    const offset: number = date.getHours() - date.getUTCHours();
    const expectedHours: number = date.getHours() - offset;
    expect(result!.getHours()).toBe(expectedHours >= 0 ? expectedHours : expectedHours + 24);
  });

  it('should preserve minutes and seconds', () => {
    const date: Date = new Date(2026, 5, 15, 12, 45, 30);
    const result: Date | null = pipe.transform(date);
    expect(result!.getMinutes()).toBe(45);
    expect(result!.getSeconds()).toBe(30);
  });
});
