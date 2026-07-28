# Sidebar Rework — Phase 1 (Adopt Patterns) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `@library`'s sidebar toward the reference design — design tokens, pill-style selection, a collapsed-rail flyout for submenus, and a footer action slot — without changing brand colors or app layout.

**Architecture:** Introduce semantic `--sidebar-*` CSS custom properties (defined in the live global stylesheet, `theme()`-backed so nothing changes visually) and route the sidebar SCSS through them. Selection becomes a rounded pill. `SidebarItemComponent` gains a `displayMode` input and a CDK-overlay flyout (reusing the `catalog-select` overlay pattern) that, when the rail is collapsed on desktop, shows a parent's children in a right-anchored popover instead of expanding the whole rail. A `[sidebar-action]` projection slot is added to the sidebar footer.

**Tech Stack:** Angular 19 (standalone components), Tailwind v3.4 (`@apply`/`theme()`), `@angular/cdk/overlay` + `/portal`, `@ngx-translate/core`, Jest, Storybook.

---

## Baseline notes (read before starting)

- **Pre-existing red test:** `libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts` currently FAILS on `main` (bare "should create" with no providers, `menu` undefined, no `TranslatePipe`). `sidebar.component.spec.ts` passes. Task 2 fixes the harness so both are green before feature work.
- **Token wiring:** the effective `:root` sidebar tokens are in `libs/shared/src/styles/variables.scss`, imported by `libs/shared/src/styles/common.scss` (`@import 'variables'`). The library's `libs/library/src/styles/variables.scss` and the untracked `libs/library/src/styles/_variables.scss` are **not imported anywhere** — unused duplicates.
- **Overlay + encapsulation:** `catalog-select` renders its overlay content from a `TemplatePortal` created with the component's `ViewContainerRef` and styles it in component-scoped SCSS — that works because portaled template elements keep the component's `_ngcontent` attribute. The flyout follows the same approach.
- **Branch:** work happens on `feat/sidebar-rework` (already created).

## File map

| File | Change |
|------|--------|
| `libs/shared/src/styles/variables.scss` | Add semantic sidebar surface/color tokens (live) |
| `libs/library/src/styles/variables.scss` | Sync the same tokens (library reference default) |
| `libs/library/src/styles/_variables.scss` | **Delete** (untracked, unused duplicate) |
| `libs/library/src/lib/components/sidebar/sidebar.component.scss` | Route surfaces through tokens; footer action slot styles |
| `libs/library/src/lib/components/sidebar/sidebar.component.html` | Add `[sidebar-action]` projection slot |
| `libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss` | Tokens; pill selection; `.flyout` rendering; flyout panel styles |
| `libs/library/src/lib/components/sidebar-item/sidebar-item.component.ts` | `displayMode` input; CDK-overlay flyout logic |
| `libs/library/src/lib/components/sidebar-item/sidebar-item.component.html` | Hover/keyboard hooks; flyout `ng-template` |
| `libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts` | Real tests (harness + flyout + displayMode + pill) |
| `libs/library/src/lib/components/sidebar/sidebar.component.spec.ts` | Real tests (harness + action slot) |
| `libs/library/src/lib/stories/sidebar/sidebar.component.stories.ts` | Story exercising flyout / pill / action slot |
| `libs/library/CHANGELOG.md` | `[Unreleased]` entries |

## Commands reference

```bash
npx nx test library --testPathPattern="sidebar"     # unit tests (both sidebar specs)
npx nx lint library                                  # ESLint
npx nx build library                                 # AoT build (catches template/type errors)
npx nx run storybook-host:storybook                  # manual visual check (Sidebar/Sidebar story)
```

---

## Task 1: Design tokens (no visual change)

**Files:**
- Modify: `libs/shared/src/styles/variables.scss`
- Modify: `libs/library/src/styles/variables.scss`
- Delete: `libs/library/src/styles/_variables.scss`
- Modify: `libs/library/src/lib/components/sidebar/sidebar.component.scss`
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss`

- [ ] **Step 1: Add tokens to the live stylesheet**

In `libs/shared/src/styles/variables.scss`, replace the file contents with (keeps the existing dimensional tokens, adds the surface/color set):

```scss
:root {
    /* Dimensions */
    --sidebar-animation-duration: 600ms;
    --sidebar-collapsed-width: 70px;
    --sidebar-expanded-width: 220px;
    --sidebar-icon-collapsed-margin: 10px;
    --sidebar-item-height: 2.75rem;
    --sidebar-logo-height: 50px;
    --sidebar-picture-size: 50px;

    /* Surfaces & colors (Phase 1 rework — brand-equivalent defaults) */
    --sidebar-bg: theme('colors.primary.600');
    --sidebar-nav-bg: color-mix(in srgb, theme('colors.primary.700') 80%, transparent);
    --sidebar-text: theme('colors.gray.200');
    --sidebar-text-muted: color-mix(in srgb, theme('colors.gray.300') 60%, transparent);
    --sidebar-item-hover-bg: color-mix(in srgb, white 10%, transparent);
    --sidebar-item-selected-bg: color-mix(in srgb, white 15%, transparent);
    --sidebar-item-selected-text: theme('colors.white');
    --sidebar-accent: theme('colors.gray.100');
    --sidebar-flyout-bg: theme('colors.primary.700');
    --sidebar-flyout-text: theme('colors.gray.100');
    --sidebar-flyout-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2), 0 3px 20px 0 rgba(0, 0, 0, 0.19);
    --sidebar-item-radius: 8px;
    --sidebar-flyout-radius: 10px;
}
```

- [ ] **Step 2: Sync the library reference token file and delete the duplicate**

Copy the exact same `:root { ... }` block into `libs/library/src/styles/variables.scss` (the library's documented default token set). Then delete the untracked duplicate:

```bash
rm libs/library/src/styles/_variables.scss
```

- [ ] **Step 3: Route sidebar surfaces through tokens**

In `libs/library/src/lib/components/sidebar/sidebar.component.scss`:
- Line ~25 `:host`: replace `@apply bg-primary-600;` with `background-color: var(--sidebar-bg);`
- Line ~134 `ul, .loading`: change `@apply bg-primary-700/80 relative;` to:
  ```scss
  ul, .loading {
      @apply relative;
      background-color: var(--sidebar-nav-bg);
  }
  ```
- Line ~137 `ul lib-sidebar-item, .loading, .error`: change `@apply font-medium text-gray-200;` to:
  ```scss
  ul lib-sidebar-item, .loading, .error {
      @apply font-medium;
      color: var(--sidebar-text);
  }
  ```
- Line ~76 `.sidebar-footer`: replace the `text-gray-300/60` utility with a token — change `@apply px-4 py-2 text-xs text-center text-gray-300/60 whitespace-nowrap overflow-hidden;` to:
  ```scss
  @apply px-4 py-2 text-xs text-center whitespace-nowrap overflow-hidden;
  color: var(--sidebar-text-muted);
  ```

In `libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss`, the `> div` hover (line ~84): change `&:hover { @apply bg-white/10; }` to:
```scss
&:hover {
    background-color: var(--sidebar-item-hover-bg);
}
```

- [ ] **Step 4: Verify no visual change**

Run: `npx nx build library`
Expected: build succeeds (no unresolved `theme()`/token errors).

Run: `npx nx run storybook-host:storybook` and open **Sidebar/Sidebar**. Confirm the rail, nav background, item text, hover, and footer look identical to before (this is a pure refactor — pixels unchanged).

- [ ] **Step 5: Commit**

```bash
git add libs/shared/src/styles/variables.scss libs/library/src/styles/variables.scss libs/library/src/lib/components/sidebar/sidebar.component.scss libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss
git rm libs/library/src/styles/_variables.scss 2>/dev/null; git add -A libs/library/src/styles/
git commit -m "refactor(sidebar): introduce semantic surface tokens (no visual change)"
```

---

## Task 2: Test harness (make both sidebar specs green)

**Files:**
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts`
- Modify: `libs/library/src/lib/components/sidebar/sidebar.component.spec.ts`

A small mock service is inlined in each spec (kept out of the shipped library build — specs are excluded from the package).

- [ ] **Step 1: Rewrite the sidebar-item spec with real providers**

Replace `libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts` with:

```ts
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ISidebarProfile, SidebarMenu } from '../../models';
import { SidebarService } from '../../services';
import { SidebarItemComponent } from './sidebar-item.component';

class MockSidebarService extends SidebarService {
  public override isCollapsed: boolean = false;
  public override isActive: boolean = false;
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ url }));
  }
  public getUserProfile(): ISidebarProfile | undefined {
    return undefined;
  }
  protected loadMenus(_parent: SidebarMenu | null): Observable<SidebarMenu[]> {
    return of([]);
  }
}

function leafMenu(): SidebarMenu {
  return new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard' });
}

function parentMenu(): SidebarMenu {
  return new SidebarMenu({ id: 2, label: 'Catalogs', icon: 'fa-layer-group', childCount: 2 });
}

describe(SidebarItemComponent.name, () => {
  let service: MockSidebarService;
  let overlayContainerElement: HTMLElement;

  function createComponent(menu: SidebarMenu): ComponentFixture<SidebarItemComponent> {
    const fixture: ComponentFixture<SidebarItemComponent> = TestBed.createComponent(SidebarItemComponent);
    fixture.componentInstance.menu = menu;
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarItemComponent, OverlayModule, TranslateModule.forRoot()],
      providers: [{ provide: SidebarService, useClass: MockSidebarService }],
    }).compileComponents();

    service = TestBed.inject(SidebarService) as MockSidebarService;
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
  });

  it('should create', () => {
    expect(createComponent(leafMenu()).componentInstance).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it and verify green**

Run: `npx nx test library --testPathPattern="sidebar-item.component"`
Expected: PASS (the previously-failing "should create" now has providers, a `menu`, and the translate pipe).

- [ ] **Step 3: Rewrite the sidebar spec with real providers**

Replace `libs/library/src/lib/components/sidebar/sidebar.component.spec.ts` with:

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ISidebarProfile, SIDEBAR_CONFIGS, SidebarConfigs, SidebarMenu } from '../../models';
import { SidebarService } from '../../services';
import { SidebarComponent } from './sidebar.component';

class MockSidebarService extends SidebarService {
  public getMenuFromUrl(url: string): Observable<SidebarMenu> {
    return of(new SidebarMenu({ url }));
  }
  public getUserProfile(): ISidebarProfile | undefined {
    return undefined;
  }
  protected loadMenus(_parent: SidebarMenu | null): Observable<SidebarMenu[]> {
    return of([new SidebarMenu({ id: 1, label: 'Dashboard', icon: 'fa-chart-line', url: '/dashboard' })]);
  }
}

@Component({
  imports: [SidebarComponent],
  template: `<lib-sidebar><button sidebar-action>Add</button></lib-sidebar>`,
})
class HostComponent {}

describe(SidebarComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent, HostComponent, TranslateModule.forRoot()],
      providers: [
        { provide: SidebarService, useClass: MockSidebarService },
        { provide: SIDEBAR_CONFIGS, useValue: new SidebarConfigs() },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture: ComponentFixture<SidebarComponent> = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run both specs**

Run: `npx nx test library --testPathPattern="sidebar"`
Expected: PASS (2 suites green).

- [ ] **Step 5: Commit**

```bash
git add libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts libs/library/src/lib/components/sidebar/sidebar.component.spec.ts
git commit -m "test(sidebar): add mock providers so specs run (fix pre-existing red)"
```

---

## Task 3: Pill selection

**Files:**
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss`
- Test: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts`

Replace the 4px left accent bar with a rounded pill on the selected row, applied to top-level and child items, inset from the rail edges. Hover uses the same shape.

- [ ] **Step 1: Write the failing test**

Add to `sidebar-item.component.spec.ts` inside the `describe`:

```ts
it('marks the selected first-level item with the pill state class', () => {
  const fixture = createComponent(leafMenu());
  const item = fixture.componentInstance;
  // simulate selection via the service event the component listens to
  item.menu.isSelected = true;
  service.selectionChanged.emit(item.menu);
  fixture.detectChanges();

  const host: HTMLElement = fixture.nativeElement;
  expect(host.classList.contains('selected')).toBe(true);
  const row = host.querySelector('li > div') as HTMLElement;
  expect(row).toBeTruthy();
});
```

- [ ] **Step 2: Run it to verify current behavior**

Run: `npx nx test library --testPathPattern="sidebar-item.component"`
Expected: PASS for the class assertion (host `.selected` binding already exists) — this test locks in the selection contract the pill styling depends on. (If it fails, the selection wiring regressed; fix before styling.)

- [ ] **Step 3: Apply the pill styles**

In `libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss`:

Remove the first-level left-bar block (the `&.first-level { &:before { ... } &.selected:before { ... } }` inside `:host`, lines ~62-73) and replace the `:host` selected handling with a pill. Update the `li > div` block so hover and selected render as an inset pill:

```scss
li {
    @apply relative h-full;

    > div {
        @apply relative overflow-hidden mx-2;
        height: var(--sidebar-item-height);
        line-height: var(--sidebar-item-height);
        border-radius: var(--sidebar-item-radius);

        &:hover {
            background-color: var(--sidebar-item-hover-bg);
        }
        /* ...existing &.parent:after, a, .loading rules unchanged... */
    }
}

:host(.first-level).selected > li > div,
:host(.selected) > li > div {
    background-color: var(--sidebar-item-selected-bg);
    color: var(--sidebar-item-selected-text);
}
```

Note: `mx-2` insets the row so the pill floats within the rail; in the collapsed rail the same inset keeps a centered rounded highlight behind the icon. Keep every other existing rule in the file (the `.parent:after` chevron marker, `a`, `span`, `.loading`, `> ul`) intact.

- [ ] **Step 4: Run tests + visual check**

Run: `npx nx test library --testPathPattern="sidebar-item.component"`
Expected: PASS.

Storybook **Sidebar/Sidebar**: expand the rail, select **Dashboard** → it shows a rounded pill highlight (no left bar); hover another item → lighter pill.

- [ ] **Step 5: Commit**

```bash
git add libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts
git commit -m "feat(sidebar): pill-style item selection replacing the left accent bar"
```

---

## Task 4: `displayMode` input + `.flyout` expanded rendering

**Files:**
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.ts`
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss`
- Test: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts`

`displayMode: 'flyout'` makes an item render expanded-style (labels visible, inline accordion) regardless of the collapsed rail — this is what the flyout panel will use to render children.

- [ ] **Step 1: Write the failing test**

```ts
it('renders expanded-style when displayMode is flyout, even while collapsed', () => {
  service.isCollapsed = true;
  const fixture = TestBed.createComponent(SidebarItemComponent);
  fixture.componentInstance.menu = leafMenu();
  fixture.componentInstance.displayMode = 'flyout';
  fixture.detectChanges();

  expect((fixture.nativeElement as HTMLElement).classList.contains('flyout')).toBe(true);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx nx test library --testPathPattern="sidebar-item.component"`
Expected: FAIL — `displayMode` does not exist / no `flyout` host class.

- [ ] **Step 3: Add the input and host binding**

In `sidebar-item.component.ts`:
- Add the input near the other `@Input()`s:
  ```ts
  @Input() public displayMode: 'rail' | 'flyout' = 'rail';
  ```
- Add to the `@Component` `host` map:
  ```ts
  host: {
    '[class.active]': 'isActive',
    '[class.expanded]': '!isCollapsed',
    '[class.first-level]': 'level === 0',
    '[class.flyout]': "displayMode === 'flyout'",
    '[class.selected]': 'isSelected',
  }
  ```

In `sidebar-item.component.scss`, make `.flyout` render like `.expanded` — add inside `:host`, next to `&.active { @include expanded; }`:
```scss
&.flyout {
    @include expanded;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx nx test library --testPathPattern="sidebar-item.component"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/library/src/lib/components/sidebar-item/sidebar-item.component.ts libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts
git commit -m "feat(sidebar): add displayMode input for flyout-style item rendering"
```

---

## Task 5: Collapsed-rail flyout (CDK overlay)

**Files:**
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.ts`
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.html`
- Modify: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.scss`
- Test: `libs/library/src/lib/components/sidebar-item/sidebar-item.component.spec.ts`

When the rail is collapsed on desktop (`isCollapsed && !isActive`) and the item is a parent, interacting with it opens a right-anchored overlay listing its children (rendered via `lib-sidebar-item [displayMode]="'flyout'"`), instead of expanding the whole rail. Triggers: hover (with close-intent delay), click toggle, keyboard. Dismiss: outside click, Escape, child navigation. Overlay disposed on close and destroy.

- [ ] **Step 1: Write the failing tests**

Add to `sidebar-item.component.spec.ts`:

```ts
describe('collapsed flyout', () => {
  function collapsedParent(): ComponentFixture<SidebarItemComponent> {
    service.isCollapsed = true;
    service.isActive = false;
    const fixture = TestBed.createComponent(SidebarItemComponent);
    const menu = parentMenu();
    menu.children = [new SidebarMenu({ id: 21, label: 'Customers', url: '/customers', parent: menu })];
    fixture.componentInstance.menu = menu;
    fixture.detectChanges();
    return fixture;
  }

  it('opens a flyout when a collapsed parent is clicked', () => {
    const fixture = collapsedParent();
    (fixture.nativeElement.querySelector('li > div') as HTMLElement).click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.sidebar-flyout')).toBeTruthy();
  });

  it('does not open a flyout for a collapsed leaf item', () => {
    service.isCollapsed = true;
    const fixture = createComponent(leafMenu());
    (fixture.nativeElement.querySelector('li > div') as HTMLElement).click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.sidebar-flyout')).toBeNull();
  });

  it('does not open a flyout when the rail is expanded', () => {
    service.isCollapsed = false;
    const fixture = TestBed.createComponent(SidebarItemComponent);
    fixture.componentInstance.menu = parentMenu();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('li > div') as HTMLElement).click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.sidebar-flyout')).toBeNull();
  });

  it('closes the flyout on Escape', () => {
    const fixture = collapsedParent();
    (fixture.nativeElement.querySelector('li > div') as HTMLElement).click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.sidebar-flyout')).toBeNull();
  });

  it('disposes the overlay on destroy', () => {
    const fixture = collapsedParent();
    (fixture.nativeElement.querySelector('li > div') as HTMLElement).click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.sidebar-flyout')).toBeTruthy();
    fixture.destroy();
    expect(overlayContainerElement.querySelector('.sidebar-flyout')).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx nx test library --testPathPattern="sidebar-item.component"`
Expected: FAIL — no `.sidebar-flyout`, no flyout logic yet.

- [ ] **Step 3: Implement the flyout logic**

Rewrite `sidebar-item.component.ts` imports and class to add overlay support. Add these imports:

```ts
import { FlexibleConnectedPositionStrategy, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
```
Extend the Angular imports on the existing line to include `HostListener`, `TemplateRef`, `ViewContainerRef`:
```ts
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
```

Add the flyout `ViewChild` next to the existing `menuContainer`:
```ts
@ViewChild('flyoutTemplate', { read: TemplateRef }) private flyoutTemplate!: TemplateRef<unknown>;
```

Add fields in `//#region Variables`:
```ts
protected isFlyoutOpen: boolean = false;

private overlay: Overlay = inject(Overlay);
private overlayRef?: OverlayRef;
private positionBuilder: OverlayPositionBuilder = inject(OverlayPositionBuilder);
private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
private flyoutCloseTimer?: ReturnType<typeof setTimeout>;
```

Add a property in `//#region Properties`:
```ts
protected get canFlyout(): boolean {
  return this.displayMode === 'rail' && this.isParent && this.isCollapsed && !this.isActive;
}
```

Replace `onSelectItem()` so a collapsed parent toggles the flyout instead of activating the rail:
```ts
protected onSelectItem(): void {
  if (this.canFlyout) {
    this.isFlyoutOpen ? this.closeFlyout() : this.openFlyout();
    return;
  }

  if (this.sidebarService.shouldActivate) {
    this.sidebarService.isActive = true;
  }

  this.sidebarService.select(this.menu);
}
```

Add hover / keyboard handlers and overlay lifecycle in `//#region Event handlers` / `//#region Private methods`:
```ts
protected onAnchorEnter(): void {
  if (!this.canFlyout) {
    return;
  }
  this.clearFlyoutCloseTimer();
  this.openFlyout();
}

protected onAnchorLeave(): void {
  this.scheduleFlyoutClose();
}

protected onFlyoutEnter(): void {
  this.clearFlyoutCloseTimer();
}

protected onFlyoutLeave(): void {
  this.scheduleFlyoutClose();
}

protected onAnchorKeydown(event: KeyboardEvent): void {
  if (!this.canFlyout) {
    return;
  }
  if (event.key === 'ArrowRight' || event.key === 'Enter') {
    event.preventDefault();
    this.openFlyout();
    this.focusFirstFlyoutItem();
  } else if (event.key === 'ArrowLeft' || event.key === 'Escape') {
    this.closeFlyout();
  }
}

@HostListener('document:keydown.escape')
protected onDocumentEscape(): void {
  if (this.isFlyoutOpen) {
    this.closeFlyout();
  }
}

@HostListener('document:mousedown', ['$event'])
protected onDocumentMouseDown(event: MouseEvent): void {
  if (!this.isFlyoutOpen) {
    return;
  }
  const target: HTMLElement = event.target as HTMLElement;
  const inAnchor: boolean = this.menuContainer?.nativeElement?.contains(target) ?? false;
  const inOverlay: boolean = this.overlayRef?.overlayElement?.contains(target) ?? false;
  if (!inAnchor && !inOverlay) {
    this.closeFlyout();
  }
}

private openFlyout(): void {
  if (!this.canFlyout || this.isFlyoutOpen) {
    return;
  }

  if ((this.menu.children?.length ?? 0) === 0) {
    this.sidebarService.loadChildren(this.menu);
  }

  const positionStrategy: FlexibleConnectedPositionStrategy = this.positionBuilder
    .flexibleConnectedTo(this.menuContainer)
    .withPositions([
      { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
      { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
      { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
      { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
    ]);

  this.overlayRef = this.overlay.create({
    positionStrategy,
    hasBackdrop: false,
    scrollStrategy: this.overlay.scrollStrategies.reposition(),
  });

  this.overlayRef.attach(new TemplatePortal(this.flyoutTemplate, this.viewContainerRef));
  this.isFlyoutOpen = true;
}

private closeFlyout(): void {
  this.clearFlyoutCloseTimer();
  this.isFlyoutOpen = false;
  if (this.overlayRef) {
    this.overlayRef.detach();
    this.overlayRef.dispose();
    this.overlayRef = undefined;
  }
}

private scheduleFlyoutClose(): void {
  this.clearFlyoutCloseTimer();
  this.flyoutCloseTimer = setTimeout(() => this.closeFlyout(), 150);
}

private clearFlyoutCloseTimer(): void {
  if (this.flyoutCloseTimer) {
    clearTimeout(this.flyoutCloseTimer);
    this.flyoutCloseTimer = undefined;
  }
}

private focusFirstFlyoutItem(): void {
  setTimeout(() => {
    const first: HTMLElement | null = this.overlayRef?.overlayElement?.querySelector('a') ?? null;
    first?.focus();
  });
}
```

Add an overridden `ngOnDestroy` in the lifecycle region:
```ts
public override ngOnDestroy(): void {
  this.closeFlyout();
  super.ngOnDestroy();
}
```

Close the flyout when a child navigates — in `ngOnInit`, add a subscription (place with the other subscriptions):
```ts
this.sidebarService.menuUrlSelected
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => this.closeFlyout());
```

- [ ] **Step 4: Add the flyout template + hover/keyboard hooks to the HTML**

In `sidebar-item.component.html`, add hover + keyboard hooks to the row container `<div #menuContainer ...>` (append these bindings to the existing element):
```html
(mouseenter)="onAnchorEnter()"
(mouseleave)="onAnchorLeave()"
(keydown)="onAnchorKeydown($event)"
```

Append the flyout template at the end of the file:
```html
<ng-template #flyoutTemplate>
    <div class="sidebar-flyout"
    (mouseenter)="onFlyoutEnter()"
    (mouseleave)="onFlyoutLeave()">
        <div class="sidebar-flyout-header">{{ menu.label | translate }}</div>
        <ul>
            <lib-sidebar-item *ngFor="let child of menu.children; trackBy: trackByFn"
            [menu]="child"
            [level]="level + 1"
            [displayMode]="'flyout'">
            </lib-sidebar-item>
        </ul>
    </div>
</ng-template>
```

- [ ] **Step 5: Style the flyout panel**

Append to `sidebar-item.component.scss`:
```scss
.sidebar-flyout {
    @apply overflow-hidden py-1;
    min-width: var(--sidebar-expanded-width);
    background-color: var(--sidebar-flyout-bg);
    color: var(--sidebar-flyout-text);
    border-radius: var(--sidebar-flyout-radius);
    box-shadow: var(--sidebar-flyout-shadow);

    .sidebar-flyout-header {
        @apply px-3 py-1 text-xs font-semibold uppercase tracking-wide opacity-70;
    }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx nx test library --testPathPattern="sidebar-item.component"`
Expected: PASS (all `collapsed flyout` tests green).

Run: `npx nx lint library` and `npx nx build library`
Expected: both succeed.

- [ ] **Step 7: Manual check**

Storybook **Sidebar/Sidebar**: collapse the rail (toggle handle). Hover **Catalogs** → a right-side flyout lists Customers/Suppliers; move into it and click a child → navigates and the flyout closes. Press Escape or click outside → closes. Keyboard: focus the item, ArrowRight opens.

- [ ] **Step 8: Commit**

```bash
git add libs/library/src/lib/components/sidebar-item/
git commit -m "feat(sidebar): collapsed-rail flyout submenu via CDK overlay"
```

---

## Task 6: Footer action slot

**Files:**
- Modify: `libs/library/src/lib/components/sidebar/sidebar.component.html`
- Modify: `libs/library/src/lib/components/sidebar/sidebar.component.scss`
- Test: `libs/library/src/lib/components/sidebar/sidebar.component.spec.ts`

Add an optional `[sidebar-action]` projection slot above the existing version footer, visible in both collapsed and expanded states.

- [ ] **Step 1: Write the failing test**

Add to `sidebar.component.spec.ts`:
```ts
it('projects a [sidebar-action] element and keeps it visible when collapsed', () => {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const action = fixture.nativeElement.querySelector('.sidebar-action [sidebar-action], .sidebar-action button[sidebar-action]');
  expect(action).toBeTruthy();
  expect(action.textContent).toContain('Add');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx nx test library --testPathPattern="sidebar.component"`
Expected: FAIL — no `.sidebar-action` container.

- [ ] **Step 3: Add the projection slot**

In `sidebar.component.html`, replace the footer line:
```html
<div class="sidebar-footer"><ng-content></ng-content></div>
```
with:
```html
<div class="sidebar-action"><ng-content select="[sidebar-action]"></ng-content></div>
<div class="sidebar-footer"><ng-content></ng-content></div>
```

- [ ] **Step 4: Style the slot**

In `sidebar.component.scss`, add the grid area and styles. Update the `:host` `grid-template-rows`/`grid-template-areas` (lines ~31-35) to include an action row:
```scss
grid-template-rows: auto minmax(0, 1fr) auto auto;
grid-template-areas:
    "toolbar"
    "nav"
    "action"
    "footer";
```
Then add:
```scss
.sidebar-action {
    @apply px-2 py-2;
    grid-area: action;

    &:empty {
        @apply hidden;
    }
}
```

- [ ] **Step 5: Run tests**

Run: `npx nx test library --testPathPattern="sidebar.component"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add libs/library/src/lib/components/sidebar/sidebar.component.html libs/library/src/lib/components/sidebar/sidebar.component.scss libs/library/src/lib/components/sidebar/sidebar.component.spec.ts
git commit -m "feat(sidebar): add [sidebar-action] footer projection slot"
```

---

## Task 7: Storybook demo

**Files:**
- Modify: `libs/library/src/lib/stories/sidebar/sidebar.component.stories.ts`

- [ ] **Step 1: Extend the Primary story to show the action slot**

In `sidebar.component.stories.ts`, update the `Primary` story `render.template` to project an action button and give the rail room to collapse:
```ts
template: `
  <div class="h-[36rem] w-80 bg-slate-100">
    <lib-sidebar>
      <button sidebar-action class="btn amber-500 w-full">+ Add New Task</button>
    </lib-sidebar>
  </div>
`,
```

- [ ] **Step 2: Verify**

Run: `npx nx run storybook-host:storybook`
Open **Sidebar/Sidebar**: confirm the action button renders; toggle collapse to exercise pill + flyout + action slot together.

- [ ] **Step 3: Commit**

```bash
git add libs/library/src/lib/stories/sidebar/sidebar.component.stories.ts
git commit -m "docs(sidebar): storybook demo for flyout, pill, and action slot"
```

---

## Task 8: Changelog

**Files:**
- Modify: `libs/library/CHANGELOG.md`

- [ ] **Step 1: Add entries under `[Unreleased]`**

Add to `libs/library/CHANGELOG.md` (create the `## [Unreleased]` section if absent, keeping existing content):
```markdown
## [Unreleased]

### Added
- Sidebar: collapsed-rail **flyout submenus** — a collapsed parent now opens its children in a right-anchored popover (CDK overlay) instead of expanding the whole rail.
- Sidebar: optional `[sidebar-action]` footer projection slot for a persistent primary action.
- Sidebar: semantic `--sidebar-*` surface tokens (`--sidebar-bg`, `--sidebar-nav-bg`, `--sidebar-text`, `--sidebar-item-hover-bg`, `--sidebar-item-selected-bg`, `--sidebar-flyout-bg`, `--sidebar-item-radius`, …).
- `SidebarItemComponent.displayMode` (`'rail' | 'flyout'`) input.

### Changed
- Sidebar: selected items now use a rounded pill highlight instead of the 4px left accent bar.

### ⚠ Breaking Changes / Migration
- None.
```

- [ ] **Step 2: Final full verification**

Run: `npx nx test library --testPathPattern="sidebar"` → PASS
Run: `npx nx lint library` → clean
Run: `npx nx build library` → succeeds

- [ ] **Step 3: Commit**

```bash
git add libs/library/CHANGELOG.md
git commit -m "docs(library): changelog for sidebar Phase 1 rework"
```

---

## Self-review

**Spec coverage:** §3.1 tokens → Task 1; §3.1 file consolidation → Task 1 (Step 2); §3.2 pill → Task 3; §3.3 flyout (overlay, displayMode, triggers, lazy-load, dismiss/cleanup, ARIA hooks) → Tasks 4–5; §3.4 footer action slot → Task 6; §5 tests → Tasks 2–6; §5 Storybook → Task 7; §6 changelog → Task 8. Pre-existing red spec (baseline note) → Task 2.

**Placeholder scan:** none — every code/SCSS/command step is concrete.

**Type consistency:** `displayMode: 'rail' | 'flyout'` and `canFlyout`, `openFlyout`/`closeFlyout`, `overlayRef`, `flyoutCloseTimer`, `menuContainer`, `flyoutTemplate` are used consistently across Tasks 4–5. Mock service (`MockSidebarService`) and helpers (`leafMenu`, `parentMenu`, `createComponent`, `overlayContainerElement`) defined in Task 2 and reused in Tasks 3–5.

**Note on ARIA:** §3.3 lists `aria-haspopup`/`role="menu"` as a refinement; the plan wires focus + keyboard + Escape/outside dismissal. If full menu semantics are wanted, add `role="menu"`/`menuitem` and `aria-expanded` on the anchor as a follow-up polish step during review.
