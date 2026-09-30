// Loaded through the package entry point, the way an application reaches it. The entry re-exports the
// components before the views, and the legacy buttons import the views barrel back, so this class is
// defined while the components barrel is still being evaluated -- before ButtonNewLegacyComponent.
import { LegacyTabViewDetails } from '../../../index';

describe('LegacyTabViewDetails', () => {
  it('should compile when loaded through the package entry point', () => {
    // Reading the component definition is what makes a JIT runtime -- Jest, TestBed -- compile it.
    expect(() => (LegacyTabViewDetails as unknown as { ɵcmp: unknown }).ɵcmp).not.toThrow();
  });
});
