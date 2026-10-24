import { DateHelpers } from './date-helpers';

describe('DateHelpers', () => {
  describe('diffDays', () => {
    it('should return 0 for the same date', () => {
      const date: Date = new Date(2026, 0, 15);
      expect(DateHelpers.diffDays(date, date)).toBe(0);
    });

    it('should return positive when initialDate is after finalDate', () => {
      const initial: Date = new Date(2026, 0, 20);
      const final: Date = new Date(2026, 0, 15);
      expect(DateHelpers.diffDays(initial, final)).toBe(5);
    });

    it('should return negative when initialDate is before finalDate', () => {
      const initial: Date = new Date(2026, 0, 10);
      const final: Date = new Date(2026, 0, 15);
      expect(DateHelpers.diffDays(initial, final)).toBe(-5);
    });

    it('should ignore time components', () => {
      const initial: Date = new Date(2026, 0, 15, 23, 59, 59);
      const final: Date = new Date(2026, 0, 15, 0, 0, 0);
      expect(DateHelpers.diffDays(initial, final)).toBe(0);
    });

    it('should handle cross-month dates', () => {
      const initial: Date = new Date(2026, 1, 1);
      const final: Date = new Date(2026, 0, 1);
      expect(DateHelpers.diffDays(initial, final)).toBe(31);
    });

    it('should handle cross-year dates', () => {
      const initial: Date = new Date(2026, 0, 1);
      const final: Date = new Date(2025, 0, 1);
      expect(DateHelpers.diffDays(initial, final)).toBe(365);
    });
  });
});
