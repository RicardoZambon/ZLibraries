import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { ApiData, ApiEntry } from '../content/content.models';
import { ApiEntryView } from './api-entry';

/** The API of the classes a component page names in its front matter. */
@Component({
  selector: 'docs-api-tables',
  imports: [ApiEntryView],
  template: `
    @for (item of entries(); track item.entry.name) {
      <docs-api-entry [entry]="item.entry" [anchorBase]="'api/' + item.entry.entryPoint" />
    }
  `,
})
export class ApiTables {
  private readonly http = inject(HttpClient);

  public readonly names = input.required<{ name: string; entryPoint: string | null }[]>();

  private readonly data = rxResource({
    params: () => [
      ...new Set(
        this.names()
          .map((n) => n.entryPoint)
          .filter((e): e is string => !!e),
      ),
    ],
    stream: ({ params }) =>
      params.length
        ? forkJoin(params.map((entryPoint) => this.http.get<ApiData>(`content/api/${entryPoint}.json`)))
        : of([] as ApiData[]),
  });

  protected readonly entries = computed(() => {
    const all = (this.data.value() ?? []).flatMap((d) => d.entries);
    return this.names()
      .map((n) => all.find((e) => e.name === n.name && e.entryPoint === n.entryPoint))
      .filter((entry): entry is ApiEntry => !!entry)
      .map((entry) => ({ entry }));
  });
}
