import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MANIFEST } from '../content/manifest';

/** Every component page, grouped as in the sidebar. */
@Component({
  selector: 'docs-components-index-page',
  imports: [RouterLink],
  template: `
    <header class="doc-header">
      <h1>Components</h1>
      <p class="lede">
        Each page shows live examples with their code, the API, and notes on accessibility and theming.
      </p>
    </header>
    @for (group of groups; track group.title) {
      <h2 class="group-title">{{ group.title }}</h2>
      <div class="cards">
        @for (item of group.items; track item.path) {
          <a class="card" [routerLink]="'/' + item.path">
            <strong>{{ item.title }}</strong>
            @if (item.summary) {
              <span>{{ item.summary }}</span>
            }
          </a>
        }
      </div>
    } @empty {
      <p>Component pages are on their way. Meanwhile, see the <a routerLink="/api/library">library API</a>.</p>
    }
  `,
  styleUrl: './cards.scss',
})
export class ComponentsIndexPage {
  protected readonly groups = MANIFEST.nav.components;
}
