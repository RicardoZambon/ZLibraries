# Change detection and zoneless

## What the package guarantees

Every component in `@zambon-dev/ui` renders correctly:

- under any change-detection strategy your components use, `OnPush` and the default alike;
- under `provideZonelessChangeDetection()`;
- under Zone.js.

You do not have to choose a strategy, or keep Zone.js, for the package's sake.

## How the package meets it

Every value a package template reads is one of these:

- a `signal` or a `computed`;
- an `input()` or a `model()`;
- a query: `viewChild()`, `viewChildren()`, `contentChild()` or `contentChildren()`;
- a value fixed for the component's lifetime;
- a getter that reads only the values above;
- an observable held in a field that is never reassigned, read with the `async` pipe.

Each of these tells Angular when it changes, so a view refreshes without a global pass. No
package component injects `ChangeDetectorRef`, and none depends on `NgZone` to be correct.

## What stays yours

The guarantee covers the package's components, not yours. If your component assigns a field
inside `.subscribe()` and shows it in its own template, nothing in the package can refresh that
view. Under `OnPush` or zoneless it goes stale.

Follow the same rules in your own components:

- Hold state a template reads in a signal.
- Keep observables for streams: HTTP calls and events with no current value.
- Convert at the edge with `toSignal(source$, { initialValue })`.

This applies when you extend a package base class too, such as `FormView` or `ListView`. Angular
does not inherit `changeDetection`: your subclass compiles to whatever it declares, which in
Angular 22 is `OnPush` when it declares nothing. Its template must follow the rules above.

## Testing your own components

`@zambon-dev/ui/testing` exports `renderUnderOnPush`. It renders a component beneath a host that
behaves like an application's `OnPush` component: once painted, a normal pass skips it. A
component that changes state without telling Angular stays stale under this host, so the test
fails. A plain `TestBed.createComponent()` plus `fixture.detectChanges()` cannot show that
failure, because `detectChanges()` refreshes the view regardless.

```ts
import { renderUnderOnPush } from '@zambon-dev/ui/testing';
```

```ts
function renderUnderOnPush<TComponent>(
  type: Type<TComponent>,
  inputs?: Record<string, unknown>,
): OnPushRender<TComponent>;
```

`inputs` are set with `ComponentRef.setInput()` before the first paint. The function returns once
the component has painted for the first time.

The returned `OnPushRender<TComponent>`:

| Member                  | Description                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| `component`             | The component instance.                                                       |
| `componentRef`          | Its `ComponentRef`.                                                           |
| `element`               | The component's host element.                                                 |
| `fixture`               | The `ComponentFixture` of the host (`InertHostComponent`).                    |
| `setInput(name, value)` | Sets an input the way a template binding would.                               |
| `tick()`                | Runs one change-detection pass that a clean `OnPush` ancestor can still skip. |

`tick()` works in both test environments. Under a zoneless test environment it runs
`ApplicationRef.tick()`. Under Zone.js it runs `fixture.detectChanges()` on the host. Call
`tick()`, never `fixture.detectChanges()` yourself.

`renderUnderOnPush` uses `TestBed`. Configure `TestBed` with the providers your component needs
before you call it.

### Example

```ts
import { Component, Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { renderUnderOnPush } from '@zambon-dev/ui/testing';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
class CounterService {
  public readonly count$ = new Subject<number>();
}

@Component({
  selector: 'app-counter',
  template: '<span class="count">{{ count() }}</span>',
})
class CounterComponent {
  protected readonly count = toSignal(inject(CounterService).count$, { initialValue: 0 });
}

it('shows a count that arrives after the first paint', () => {
  TestBed.configureTestingModule({ imports: [CounterComponent] });

  const render = renderUnderOnPush(CounterComponent);

  TestBed.inject(CounterService).count$.next(3);
  render.tick();

  expect(render.element.querySelector('.count')?.textContent).toBe('3');
});
```

### Three rules

These make the test able to fail:

1. **Drive the source after `renderUnderOnPush` returns.** Before the first paint, every strategy
   renders.
2. **Use a genuinely asynchronous source.** `of(...)` emits during the first paint, so the
   failure cannot happen. Use a `Subject` you control.
3. **Assert the DOM, not a field.** `expect(component.isLoading()).toBe(false)` passes on a blank
   screen.

### In a zoneless test environment

With no zone, a view renders only when something notifies Angular. Wait with
`await fixture.whenStable()` before you assert. Do not call `fixture.detectChanges()`: under
zoneless it refreshes every test view, whether or not anything changed. `fakeAsync` and `tick`
from `@angular/core/testing` need Zone.js; use `whenStable()` instead.

A clean browser console proves nothing. Angular's development-mode checks do not run on every
path. A test like the one above is the reliable check.

## References

- [render-under-on-push.ts](https://github.com/RicardoZambon/ZLibraries/blob/main/libs/ui/src/testing/render-under-on-push.ts):
  the harness source.
