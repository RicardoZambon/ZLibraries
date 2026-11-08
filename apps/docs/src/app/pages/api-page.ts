import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ApiEntry } from '../content/content.models';
import { ContentService } from '../content/content.service';
import { ENTRY_POINT_TITLES } from '../content/manifest';
import { ApiEntryView } from './api-entry';

const GROUPS: { title: string; kinds: string[] }[] = [
  { title: 'Components', kinds: ['component'] },
  { title: 'Directives', kinds: ['directive'] },
  { title: 'Pipes', kinds: ['pipe'] },
  { title: 'Classes and services', kinds: ['undecorated_class'] },
  { title: 'Interfaces', kinds: ['interface'] },
  { title: 'Types and enums', kinds: ['type_alias', 'enum'] },
  { title: 'Functions and constants', kinds: ['function', 'constant'] },
  { title: 'NgModules', kinds: ['ng_module'] },
];

/** Every export of one entry point, generated from the package source and its JSDoc. */
@Component({
  selector: 'docs-api-page',
  imports: [ApiEntryView, RouterLink],
  template: `
    <div class="api-page" data-pagefind-body>
      <header class="doc-header">
        <p class="eyebrow">API reference</p>
        <h1>
          <code>&#64;zambon-dev/ui/{{ entryPoint() }}</code>
        </h1>
        <p class="lede">
          Every export of this entry point, generated from the source. Import from
          <code>&#64;zambon-dev/ui/{{ entryPoint() }}</code
          >.
        </p>
        <label class="filter">
          <span class="visually-hidden">Filter exports</span>
          <input type="search" placeholder="Filter by name" [value]="filter()" (input)="onFilter($event)" />
        </label>
      </header>

      @if (api.value()) {
        @for (group of groups(); track group.title) {
          <h2 [id]="group.id">{{ group.title }}</h2>
          <ul class="api-index">
            @for (entry of group.entries; track entry.name) {
              <li>
                <a [routerLink]="[]" [fragment]="entry.name" [class.is-deprecated]="entry.deprecated">{{
                  entry.name
                }}</a>
              </li>
            }
          </ul>
          @for (entry of group.entries; track entry.name) {
            <docs-api-entry [entry]="entry" [anchorBase]="'api/' + entryPoint()" />
          }
        } @empty {
          <p>No export matches “{{ filter() }}”.</p>
        }
      } @else if (api.error()) {
        <p>This entry point does not exist.</p>
      } @else {
        <p aria-busy="true">Loading…</p>
      }
    </div>
  `,
  styleUrl: './api-page.scss',
})
export class ApiPage {
  private readonly title = inject(Title);
  public readonly entryPoint = input.required<string>();
  protected readonly filter = signal('');
  protected readonly api = inject(ContentService).api(this.entryPoint);

  protected readonly groups = computed(() => {
    const term = this.filter().trim().toLowerCase();
    const entries = (this.api.value()?.entries ?? []).filter((e) => !term || e.name.toLowerCase().includes(term));
    return GROUPS.map((group) => ({
      title: group.title,
      id: group.title.toLowerCase().replace(/[^a-z]+/g, '-'),
      entries: entries.filter((e: ApiEntry) => group.kinds.includes(e.kind)),
    })).filter((group) => group.entries.length);
  });

  constructor() {
    effect(() => {
      const name = ENTRY_POINT_TITLES[this.entryPoint()] ?? this.entryPoint();
      this.title.setTitle(`${name} API · ZLibraries`);
    });
  }

  protected onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }
}
