import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentService } from '../content/content.service';
import { followInternalLink } from '../content/internal-links';
import { TrustedHtmlPipe } from '../content/trusted-html.pipe';
import { ExampleViewer } from '../example/example-viewer';
import { ApiTables } from './api-tables';

/** A guide, a component page or the changelog: Markdown rendered by the content build. */
@Component({
  selector: 'docs-doc-page',
  imports: [TrustedHtmlPipe, ExampleViewer, ApiTables, RouterLink],
  templateUrl: './doc-page.html',
  styleUrl: './doc-page.scss',
})
export class DocPage {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly content = inject(ContentService);
  private readonly data = toSignal(inject(ActivatedRoute).data, { initialValue: {} as Record<string, string> });

  public readonly slug = input<string>();

  protected readonly route = computed(() => {
    const data = this.data();
    return data['route'] ?? (data['section'] && this.slug() ? `${data['section']}/${this.slug()}` : undefined);
  });

  protected readonly page = this.content.page(this.route);

  constructor() {
    effect(() => {
      const page = this.page.value();
      if (page) this.title.setTitle(`${page.title} · ZLibraries`);
    });
  }

  protected onContentClick(event: MouseEvent): void {
    followInternalLink(event, this.router);
  }
}
