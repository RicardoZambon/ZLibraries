import { LocationStrategy } from '@angular/common';
import {
  afterNextRender,
  APP_ID,
  ApplicationRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';

let islandCount = 0;

/**
 * Keeps an example's router in memory. Without it, the example's router would read and rewrite
 * the page URL, which belongs to the docs shell.
 */
class IslandLocationStrategy extends LocationStrategy {
  private current = '/';

  public path(): string {
    return this.current;
  }
  public prepareExternalUrl(internal: string): string {
    return internal;
  }
  public getState(): unknown {
    return null;
  }
  public pushState(_state: unknown, _title: string, url: string, query: string): void {
    this.current = query ? `${url}?${query}` : url;
  }
  public replaceState(state: unknown, title: string, url: string, query: string): void {
    this.pushState(state, title, url, query);
  }
  public forward(): void {
    /* No history in memory. */
  }
  public back(): void {
    /* No history in memory. */
  }
  public onPopState(): void {
    /* The page's history events belong to the shell. */
  }
  public getBaseHref(): string {
    return '/';
  }
}

/**
 * Runs one example as its own small Angular application, in the browser only.
 *
 * Each example gets the same providers Storybook uses, so an example behaves the same in both
 * places, and its own APP_ID, so two examples on one page never share style or DOM ids. The
 * application is destroyed with this component.
 */
@Component({
  selector: 'docs-example-island',
  template: `
    <div #host class="island-host"></div>
    @if (failed()) {
      <p class="island-error">This example could not start. Open the browser console for details.</p>
    }
  `,
  styles: `
    .island-error {
      margin: 0;
      color: var(--color-content-secondary);
    }
  `,
})
export class ExampleIsland {
  public readonly exampleId = input.required<string>();
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  protected readonly failed = signal(false);
  private appRef?: ApplicationRef;
  private destroyed = false;

  constructor() {
    afterNextRender(() => void this.boot());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.appRef?.destroy();
    });
  }

  private async boot(): Promise<void> {
    try {
      const { EXAMPLES, exampleProviders } = await import('@zambon-dev/ui-examples');
      const entry = EXAMPLES.find((e) => e.id === this.exampleId());
      if (!entry) throw new Error(`Unknown example "${this.exampleId()}"`);
      const component = await entry.load();
      const appRef = await createApplication({
        providers: [
          ...exampleProviders,
          provideZonelessChangeDetection(),
          provideRouter([], withDisabledInitialNavigation()),
          { provide: LocationStrategy, useClass: IslandLocationStrategy },
          { provide: APP_ID, useValue: `example${++islandCount}` },
        ],
      });
      if (this.destroyed) {
        appRef.destroy();
        return;
      }
      const root = document.createElement('div');
      this.host().nativeElement.appendChild(root);
      appRef.bootstrap(component, root);
      this.appRef = appRef;
    } catch (error) {
      console.error(error);
      this.failed.set(true);
    }
  }
}
