import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { exampleProviders } from './providers/example.providers';
import { EXAMPLES } from './registry';

/*
 * A smoke test over the registry: every example loads, renders under the global providers alone,
 * and settles without throwing. It is what keeps the "the example provides what it needs" rule
 * true, because nothing else here would notice a missing provider before the docs site does.
 */
describe('example registry', () => {
  // jsdom has no ResizeObserver, and the data grid observes its body. Layout is not under test here.
  beforeAll(() => {
    globalThis.ResizeObserver ??= class {
      public observe = jest.fn();
      public unobserve = jest.fn();
      public disconnect = jest.fn();
    };
  });

  it('has unique ids', () => {
    const ids = EXAMPLES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(EXAMPLES.map((entry) => [entry.id, entry] as const))('renders %s', async (_id, entry) => {
    const component: Type<unknown> = await entry.load();

    TestBed.configureTestingModule({ imports: [component], providers: exampleProviders });
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.children.length).toBeGreaterThan(0);
    fixture.destroy();
  });
});
