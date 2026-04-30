import { GuidHelper } from './guid-helper';

describe('GuidHelper', () => {
  describe('generateGUID', () => {
    it('should return a string in UUID v4 format', () => {
      const guid: string = GuidHelper.generateGUID();
      const uuidV4Regex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

      expect(guid).toMatch(uuidV4Regex);
    });

    it('should generate unique GUIDs on each call', () => {
      const guids: Set<string> = new Set(
        Array.from({ length: 100 }, () => GuidHelper.generateGUID())
      );

      expect(guids.size).toBe(100);
    });

    it('should always have 4 as the version digit', () => {
      const guid: string = GuidHelper.generateGUID();
      const parts: string[] = guid.split('-');

      expect(parts[2][0]).toBe('4');
    });

    it('should have a valid variant digit (8, 9, a, or b)', () => {
      const guid: string = GuidHelper.generateGUID();
      const parts: string[] = guid.split('-');

      expect(['8', '9', 'a', 'b']).toContain(parts[3][0]);
    });
  });
});
