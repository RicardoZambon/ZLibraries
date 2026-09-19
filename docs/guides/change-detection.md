# Change detection

Every component in this workspace ran Angular's default change detection, which means each
consumer application pays a full pass through all of them on every event. For a component
library that is the largest avoidable cost we impose on consumers.

Moving to `ChangeDetectionStrategy.OnPush` is the fix, but it is not a mechanical one: OnPush
only re-renders a component when an input reference changes, when an event fires inside its own
template, or when something explicitly marks it dirty. Anything that mutates state outside those
three paths silently stops rendering. That failure is invisible to a "should create" test, which
is most of what this repo had.

So the migration is per-component, and each one needs a test that proves the view still updates.

## Done

| Component                   | Why it was safe                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| `DataGridRowComponent`      | Already OnPush before this work                                                                    |
| `RibbonComponent`           | Pure `<ng-content>` wrapper with no state                                                          |
| `FormGroupComponent`        | Renders two `@Input()`s and nothing else                                                           |
| `GroupContainerComponent`   | Template reads only `title` and `icon`; its other members are API for parents, never rendered here |
| `LoginLayoutComponent`      | Static shell around a `<router-outlet>`                                                            |
| `HomeComponent`             | Static                                                                                             |
| `BrandComponent`            | Reads `APP_CONFIG`, which is fixed for the application's lifetime                                  |
| `EnvironmentBadgeComponent` | Same                                                                                               |

Each of those has a spec that changes an input through `componentRef.setInput` and asserts the
rendered DOM, so a regression shows up as a failing test rather than a blank panel.

## Remaining

66 components. They fall into three groups, and the group decides the work:

**37 assign fields from a `.subscribe()` callback.** An RxJS callback is not one of OnPush's
three wake-up paths, so the assignment lands but the view does not update. Each needs either
`ChangeDetectorRef.markForCheck()` at the end of the callback, or — better — the value moved
into a signal or rendered through the `async` pipe so the framework tracks it.

**3 mutate state from `setTimeout` / `setInterval` / `runOutsideAngular`.** Same problem, same
options, plus the ones already outside the zone need care not to re-enter it just to render.

**26 have no obvious asynchronous trigger.** These are the next ones to take. Most should be
straightforward, but read the template before assuming: the common trap here is a `protected get`
backed by an injected service whose state changes elsewhere. `TabBreadcrumbsComponent` reading
`tabService.activeTabHistory` is the clearest example — the getter looks pure, but nothing marks
the component dirty when the service's array changes.

Components that hold a modal and are driven imperatively by a parent — `ErrorModalComponent`,
`ConfirmModalComponent` — are a related trap. A parent calling `modal.showModal(...)` from a
subscription sets fields on a component that has no idea it needs to re-render.

## Working on one

1. Read the template and list every expression it evaluates.
2. For each, find what changes it. If the answer is not "an input reference" or "an event in
   this template", that path needs `markForCheck()`, a signal, or the `async` pipe.
3. Add `changeDetection: ChangeDetectionStrategy.OnPush`.
4. Write a spec that mutates each of those sources and asserts the DOM after
   `fixture.detectChanges()`. `componentRef.setInput` for inputs; for service-backed state, push
   through the real service and assert.
5. Run `nx test <project>`.

A clean Storybook console does not prove the component still renders — see the NG0100 notes in
`libs/framework/CLAUDE.md` for why a Jest `detectChanges()` test is the reliable oracle.
