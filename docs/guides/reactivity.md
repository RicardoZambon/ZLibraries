# Reactivity

## The contract

> Every value a library template reads is a `signal`, a `computed`, an `input()`/`model()`, a
> `viewChild()`/`contentChildren()`, or a constant fixed for the component's lifetime.
>
> No library template reads a plain mutable field, a `get` backed by a service's mutable state, or
> a value assigned inside `.subscribe()`.
>
> No library component declares `changeDetection`, and none calls `ChangeDetectorRef`.
>
> **What this guarantees a consumer:** a component from these packages renders correctly under any
> change-detection strategy the host application uses, and under `provideZonelessChangeDetection()`.
> Our packages do not make the host application's choice of strategy part of their API.
>
> **What stays the consumer's:** the state their own components own. If one of their components
> assigns a field inside a `.subscribe()` and renders it in its own template, nothing in these
> packages can know.

Boundary rule: **Observables cross boundaries; signals hold state a template reads.** RxJS is not
going anywhere — HTTP calls, and hot notifications with no current value, stay streams. Convert at
the edge with `toSignal(..., { initialValue })`.

## Why, precisely

Angular 22 inverted the default. A component that declares no strategy now compiles to `OnPush`,
and the old always-check `Default` was renamed `ChangeDetectionStrategy.Eager` (`Default` is a
deprecated alias for the same value). The `ng update` migration stamped `Eager` on every existing
component to preserve behaviour — which is why most of this workspace carries it.

Three facts from the runtime, each verifiable in `node_modules/@angular/core`:

**1. `Eager` does not save a component under a clean `OnPush` ancestor.** In `detectChangesInView`,
the `CheckAlways` flag that `Eager` sets is only consulted in Global traversal mode. A clean
`OnPush` view is skipped and the descent continues in **Targeted** mode, where that flag is never
read again. Everything below is unreachable regardless of what it declares. A library cannot
guarantee rendering by choosing a strategy — only by **notifying**.

**2. `changeDetection` is not inherited.** `ɵɵInheritDefinitionFeature` copies inputs, outputs,
host bindings, queries, animations and host attributes. It does not copy `onPush`. A strategy
declared on an abstract base describes a class that is never instantiated; every subclass compiles
to whatever it declares, which for consumer code means `OnPush`. This is why the bases here declare
nothing and carry a comment saying so.

**3. `detectChanges()` never refreshes the component's own host bindings.** `processHostBindingOpCodes`
runs inside the **parent's** `refreshView`. Calling `changeDetectorRef.detectChanges()` on yourself
refreshes your template and leaves your own `host: { '[class.x]': ... }` stale — and writing that
value after the parent's pass raises NG0100 instead. Two components in this workspace were broken
exactly this way. If a host binding is involved, a signal is the only mechanism that works.

## Working on one

1. Read the template and list every expression it evaluates.
2. For each, find what changes it. Anything that is not an input reference or an event in this
   template needs to become a signal.
3. Convert: fields → `signal()`, derived getters → `computed()`, `@Input()` → `input()`,
   `@Input() set` → `input()` plus `computed`/`linkedSignal`, `@Output()` → `output()`,
   `@ViewChild`/`@ContentChildren` → `viewChild()`/`contentChildren()`.
4. Delete `changeDetection: ChangeDetectionStrategy.Eager` and any `ChangeDetectorRef`.
5. Delete the component's line from `STILL_EAGER` in that library's
   `src/lib/change-detection-contract.spec.ts`.
6. Add a spec per asynchronous source the template depends on (below).

**Rename anything you convert** — `loading` → `isLoading`, `visible` → `isVisible`. A signal that
keeps its old name leaves a consumer's `@if (loading)` compiling and permanently truthy; the
`interpolatedSignalNotInvoked` diagnostic catches `{{ loading }}` but not `@if (loading)`. With a
rename, every call site they miss is a compile error.

## The test oracle

The hole this closes: under `setupZoneTestEnv`, `fixture.detectChanges()` force-refreshes the host
view and descends in Global mode. "Nothing marked this view dirty" **cannot be expressed** in that
harness. The specs here were not merely weak; they were structurally incapable of catching the
failure. Three layers now:

**C — the contract spec.** `src/lib/change-detection-contract.spec.ts` in each library asserts, over
the public API, that exactly the components on a named list still declare `Eager`. It fails in both
directions: a new `Eager` component, or a migrated one left on the list.

**B — the zoneless test environment.** All three `src/test-setup.ts` use `setupZonelessTestEnv`.
With no ambient tick, a view renders only when something notifies the scheduler, so every
subscribe-driven component is under test by default. Assert after `await fixture.whenStable()` —
**never** `fixture.detectChanges()`, which under zoneless sets `includeAllTestViews` and refreshes
everything regardless. `fakeAsync`/`tick` are zone-based; use `whenStable()`.

**A — the OnPush-ancestor harness**, exported as `@zambon-dev/ui/testing`:

```ts
const render = renderUnderOnPush(SidebarComponent);
rootMenus.next([...]);   // after the first paint
render.tick();           // ApplicationRef.tick(), the production pass
expect(render.element.querySelector('.loading')).toBeNull();
```

`render.tick()` picks the pass that actually discriminates in the environment it finds:
`ApplicationRef.tick()` under zoneless, where the fixture registers its host view for
auto-detection, and `fixture.detectChanges()` under zone, where it does not and `tick()` would
reach nothing. Both leave a clean OnPush ancestor free to short-circuit. That is why a consumer
still on zone can use this harness without changing their test setup first.

Three rules make it an oracle rather than decoration:

1. **Drive the source after the call returns.** Before the first paint every strategy renders.
2. **The source must be genuinely asynchronous.** `of(...)` emits inside `ngOnInit`, i.e. inside the
   first paint, so the failure cannot occur. Use a `Subject` you control.
3. **Assert the DOM, never a field.** `expect(component.loading).toBe(false)` passes on a blank
   screen.

`render-under-on-push.spec.ts` proves the harness discriminates, including that a component
declaring `Eager` stays just as stale as one declaring nothing. A clean Storybook console proves
nothing — see the NG0100 notes in `libs/ui/CLAUDE.md`.

## One bridge, deliberately

`TabService` keeps a `revision` signal: every write to the tab state bumps it, and the public
getters read it. That read is what makes a template using them re-render.

It is a bridge, not the destination. The tab state is a tree of arrays mutated in place, with
`ITab` objects whose titles are rewritten as they resolve, so a signal holding the array could
not see any of it; converting that service properly is its own change. The rendering guarantee
holds either way, which is the point -- but do not copy this shape into a component. There, the
state itself becomes the signal.

## Deferrals that are not change-detection dodges

Do not "fix" these:

- `group-accordion.component.ts` — the two `setTimeout`s sequence a CSS transition (set
  `max-height` one frame, toggle the class the next). One of them is a transition duration.
- `data-provider.service.ts` — the `queueMicrotask` orders construction, not rendering.

## Where this stands

Done: all 20 view/button/filter base classes; `SidebarService`, `SidebarComponent`,
`SidebarItemComponent`, `RibbonGroupComponent`, `RibbonGroupChild`, `BaseButton`,
`TabsComponent`, `TabService` (via the bridge above), `ServicesHistoryFilterComponent`,
`ModalComponent`, `GroupAccordionComponent`, `GroupScrollSpyComponent`, `MultiSelectComponent`
and `MultiEditorComponent`.

Remaining: the lists in the three `change-detection-contract.spec.ts` files -- 21 in framework, 6
in library, 9 in the shared public API, plus `LanguageSelectorComponent` and `LoginComponent`,
which shared does not export and the contract spec therefore cannot reach.

**Take the datasets next.** Every library component still on the list reads a dataset or a service
directly from its template -- `resultDataset.displayedRows`, `dataGridDataset.columns`,
`formService.loading`. Migrating those components first would only move the problem: the component
would hold signals and still read mutable state that cannot notify it. `MultiSelectResultDataset`,
`DataGridDataset`, `FormService` and `DataProviderService` come first, and the components that
read them follow in the same slice.

A worked example of why: `MultiSelectResultGridComponent` looks safe, because removing an item
flips a loading flag whose write happens to refresh the view. It is not -- `onItemRemoved` changes
`displayedRows` with no flag anywhere near it, so the row stays on screen. A loading flag that
refreshes the view as a side effect hides this class of bug rather than fixing it.
