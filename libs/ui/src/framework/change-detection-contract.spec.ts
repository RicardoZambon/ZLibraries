import { Type, ɵgetComponentDef as getComponentDef } from '@angular/core';
import * as publicApi from './index';

/**
 * Keeps every exported component of `@zambon-dev/ui/framework` off `Eager`.
 *
 * Angular 22 compiles a component that declares no strategy to OnPush, so `Eager` is an explicit
 * opt-out: the component depends on being walked on every pass. No exported component may declare
 * it, so the list below stays empty. It fails in both directions: a component that declares
 * `Eager` fails because it is not listed, and a listed component that no longer declares it fails
 * until its line is removed.
 *
 * This covers the public surface, which is what a consumer can be broken by. Components the layer
 * does not export are covered by `@angular-eslint/prefer-on-push-component-change-detection`, an
 * error in eslint.config.mjs.
 */
const STILL_EAGER: readonly string[] = [];

describe('change-detection contract', () => {
  const components: [string, Type<unknown>][] = Object.entries(publicApi)
    .filter(([, value]: [string, unknown]) => typeof value === 'function')
    .filter(([, value]: [string, unknown]) => !!getComponentDef(<Type<unknown>>value))
    .map(([name, value]: [string, unknown]) => [name, <Type<unknown>>value]);

  it('finds the exported components, so the assertion below cannot pass vacuously', () => {
    expect(components.length).toBeGreaterThanOrEqual(17);
  });

  it('declares Eager only for the components still queued for migration', () => {
    const eager: string[] = components
      .filter(([, type]: [string, Type<unknown>]) => getComponentDef(type)?.onPush === false)
      .map(([name]: [string, Type<unknown>]) => name)
      .sort();

    expect(eager).toEqual([...STILL_EAGER].sort());
  });
});
