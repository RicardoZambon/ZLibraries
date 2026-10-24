import { Type, ɵgetComponentDef as getComponentDef } from '@angular/core';
import * as publicApi from '../index';

/**
 * The migration ratchet for `@zambon-dev/library`.
 *
 * Angular 22 compiles a component that declares no strategy to OnPush, so `Eager` here is an
 * explicit opt-out: the component still depends on being walked on every pass and has not been
 * moved onto signals yet. The list below is the work that remains.
 *
 * This fails in both directions on purpose. A new component declaring `Eager` fails because it is
 * not on the list; a component that has been migrated fails until its line is deleted. Neither
 * can drift quietly, which is exactly what happened the last time -- the build, the tests and
 * four validators were green while the consuming application was visibly broken.
 *
 * When this list is empty, turn `@angular-eslint/prefer-on-push-component-change-detection` from
 * 'warn' to 'error' in eslint.config.mjs and delete the allowance.
 */
const STILL_EAGER: readonly string[] = [
  'CatalogSelectComponent',
  'DataGridComponent',
  'FormInputComponent',
  'FormInputGroupComponent',
  'GroupAccordionComponent',
  'GroupScrollSpyComponent',
  'ModalComponent',
  'MultiEditorComponent',
  'MultiSelectComponent',
  'MultiSelectResultGridComponent',
  'RibbonButtonComponent',
];

describe('change-detection contract', () => {
  const components: [string, Type<unknown>][] = Object.entries(publicApi)
    .filter(([, value]: [string, unknown]) => typeof value === 'function')
    .filter(([, value]: [string, unknown]) => !!getComponentDef(<Type<unknown>>value))
    .map(([name, value]: [string, unknown]) => [name, <Type<unknown>>value]);

  it('finds the exported components, so the assertion below cannot pass vacuously', () => {
    expect(components.length).toBeGreaterThanOrEqual(11);
  });

  it('declares Eager only for the components still queued for migration', () => {
    const eager: string[] = components
      .filter(([, type]: [string, Type<unknown>]) => getComponentDef(type)?.onPush === false)
      .map(([name]: [string, Type<unknown>]) => name)
      .sort();

    expect(eager).toEqual([...STILL_EAGER].sort());
  });
});
