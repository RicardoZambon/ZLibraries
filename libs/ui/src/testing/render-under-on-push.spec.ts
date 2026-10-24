import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { OnPushRender, renderUnderOnPush } from './render-under-on-push';

/**
 * The oracle has to earn its keep before anything is migrated against it, so this proves it
 * discriminates: two components that fail to notify must stay stale, and the one that notifies
 * must update. If any of these three ever flips, every migration spec built on the harness is
 * worthless.
 */

/** Emits after the first paint, which is the only moment the failure is observable. */
let source: Subject<string>;

/** Angular 22's default for a component that declares no strategy. Assigns and says nothing. */
@Component({ selector: 'lib-unnotified-on-push', template: '<span class="value">{{ value }}</span>' })
class UnnotifiedOnPushComponent {
  protected value = 'initial';

  constructor() {
    source.pipe(takeUntilDestroyed()).subscribe((value: string) => (this.value = value));
  }
}

/** The strategy the Angular 22 migration stamped everywhere. Still assigns and says nothing. */
@Component({
  selector: 'lib-unnotified-eager',
  template: '<span class="value">{{ value }}</span>',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class UnnotifiedEagerComponent {
  protected value = 'initial';

  constructor() {
    source.pipe(takeUntilDestroyed()).subscribe((value: string) => (this.value = value));
  }
}

/** The contract: state a template reads is a signal. */
@Component({ selector: 'lib-notified', template: '<span class="value">{{ value() }}</span>' })
class NotifiedComponent {
  protected readonly value = signal('initial');

  constructor() {
    source.pipe(takeUntilDestroyed()).subscribe((value: string) => this.value.set(value));
  }
}

describe('renderUnderOnPush', () => {
  beforeEach(() => {
    source = new Subject<string>();
    TestBed.configureTestingModule({});
  });

  function rendered(): string | null {
    return render.element.querySelector('.value')?.textContent ?? null;
  }

  let render: OnPushRender<unknown>;

  it('paints the component under test on the first pass', () => {
    render = renderUnderOnPush(NotifiedComponent);

    expect(rendered()).toBe('initial');
  });

  it('updates the DOM when the component notifies Angular', () => {
    render = renderUnderOnPush(NotifiedComponent);

    source.next('arrived');
    render.tick();

    expect(rendered()).toBe('arrived');
  });

  it('leaves the DOM stale when an OnPush component assigns without notifying', () => {
    render = renderUnderOnPush(UnnotifiedOnPushComponent);

    source.next('arrived');
    render.tick();

    expect(rendered()).toBe('initial');
  });

  // The whole point of the migration: a clean OnPush ancestor short-circuits the traversal in
  // Targeted mode, where the CheckAlways flag that `Eager` sets is never consulted. Declaring
  // `Eager` on a library component buys it nothing.
  it('leaves the DOM stale even when the component declares Eager', () => {
    render = renderUnderOnPush(UnnotifiedEagerComponent);

    source.next('arrived');
    render.tick();

    expect(rendered()).toBe('initial');
  });
});
