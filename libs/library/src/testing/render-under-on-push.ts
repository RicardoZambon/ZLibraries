import { ApplicationRef, ComponentRef, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InertHostComponent } from './inert-host';

/** A component rendered beneath {@link InertHostComponent}, plus the handles a spec needs. */
export interface OnPushRender<TComponent> {
  /** The component under test. */
  readonly component: TComponent;
  readonly componentRef: ComponentRef<TComponent>;
  /** The component under test's own host element -- host bindings included. */
  readonly element: HTMLElement;
  /** The fixture whose root is the inert host. */
  readonly fixture: ComponentFixture<InertHostComponent>;
  /** Binds an input the way a template would, notifying Angular. */
  setInput(name: string, value: unknown): void;
  /**
   * Runs the production change-detection pass.
   *
   * Use this and never `fixture.detectChanges()`: the fixture's root host view is `CheckAlways`,
   * and under a zoneless test environment `detectChanges()` additionally forces every test view,
   * either of which hands the component a refresh it did not earn.
   */
  tick(): void;
}

/**
 * Renders `type` beneath a clean `OnPush` ancestor and returns once it has painted for the
 * first time.
 *
 * Three rules make this an oracle rather than decoration:
 *
 * 1. Drive the source **after** this call returns. Before the first paint every strategy renders.
 * 2. The source must be genuinely asynchronous. `of(...)` emits inside `ngOnInit`, i.e. inside
 *    the first paint, so the failure cannot occur. Use a `Subject` you control.
 * 3. Assert the DOM, never a field. `expect(component.loading).toBe(false)` passes on a blank
 *    screen.
 */
export function renderUnderOnPush<TComponent>(
  type: Type<TComponent>,
  inputs: Record<string, unknown> = {},
): OnPushRender<TComponent> {
  const fixture: ComponentFixture<InertHostComponent> = TestBed.createComponent(InertHostComponent);

  // Resolves the signal view query and leaves the host clean before anything is inserted into it.
  fixture.detectChanges();

  const componentRef: ComponentRef<TComponent> = fixture.componentInstance.outlet().createComponent(type);

  Object.entries(inputs).forEach(([name, value]: [string, unknown]) => componentRef.setInput(name, value));

  const applicationRef: ApplicationRef = TestBed.inject(ApplicationRef);
  const tick = (): void => applicationRef.tick();

  // The component under test is brand new and therefore dirty, so this first pass paints it and
  // then leaves the whole path clean -- the state a consumer application sits in between events.
  tick();

  return {
    component: componentRef.instance,
    componentRef,
    element: componentRef.location.nativeElement,
    fixture,
    setInput: (name: string, value: unknown): void => componentRef.setInput(name, value),
    tick,
  };
}
