import { EnumLabelPipe } from './enum-text.pipe';

enum TestEnum {
  Active = 0,
  Inactive = 1,
  Pending = 2,
}

describe('EnumLabelPipe', () => {
  let pipe: EnumLabelPipe;

  beforeEach(() => {
    pipe = new EnumLabelPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the key name for a valid enum value', () => {
    expect(pipe.transform(0, TestEnum)).toBe('Active');
  });

  it('should return the key name for another valid enum value', () => {
    expect(pipe.transform(1, TestEnum)).toBe('Inactive');
  });

  it('should return empty string for value not in enum', () => {
    expect(pipe.transform(99, TestEnum)).toBe('');
  });

  it('should return empty string when value is undefined', () => {
    expect(pipe.transform(undefined, TestEnum)).toBe('');
  });

  it('should return empty string when enumType is undefined', () => {
    expect(pipe.transform(0, undefined)).toBe('');
  });

  it('should return empty string when both are undefined', () => {
    expect(pipe.transform(undefined, undefined)).toBe('');
  });

  it('should handle string enums gracefully', () => {
    enum StringEnum {
      A = 'alpha',
      B = 'beta',
    }
    // String enums have no numeric values, so filter yields nothing
    expect(pipe.transform(0, StringEnum)).toBe('');
  });
});
