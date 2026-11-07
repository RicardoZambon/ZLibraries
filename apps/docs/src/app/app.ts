import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeSwitchComponent } from '@zambon-dev/ui/shared';
import { filter, map } from 'rxjs';
import { NavGroup } from './content/content.models';
import { ENTRY_POINT_TITLES, MANIFEST, REPO_URL, STORYBOOK_URL } from './content/manifest';
import { SearchDialog } from './search/search-dialog';

/** The docs site shell: header, section navigation and the routed page. */
@Component({
  selector: 'docs-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeSwitchComponent, SearchDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  protected readonly repoUrl = REPO_URL;
  protected readonly storybookUrl = STORYBOOK_URL;
  protected readonly menuOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Which top-level section the current page belongs to. */
  protected readonly section = computed<'home' | 'guides' | 'components' | 'api' | 'changelog' | 'other'>(() => {
    const first = this.url().split(/[/?#]/).filter(Boolean)[0] ?? '';
    if (first === '') return 'home';
    if (first === 'guides' || first === 'components' || first === 'api' || first === 'changelog') return first;
    return 'other';
  });

  /** Sidebar groups for the current section. */
  protected readonly groups = computed<NavGroup[]>(() => {
    switch (this.section()) {
      case 'guides':
        return MANIFEST.nav.guides;
      case 'components':
        return [
          { title: 'Overview', items: [{ title: 'All components', path: 'components' }] },
          ...MANIFEST.nav.components,
        ];
      case 'api':
        return [
          {
            title: 'Entry points',
            items: MANIFEST.routes.api.map((entryPoint) => ({
              title: `@zambon-dev/ui/${entryPoint}`,
              path: `api/${entryPoint}`,
              summary: ENTRY_POINT_TITLES[entryPoint],
            })),
          },
        ];
      default:
        return [];
    }
  });

  protected readonly hasSidebar = computed(() => this.groups().length > 0);

  constructor() {
    // Close the mobile menu after every navigation.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
