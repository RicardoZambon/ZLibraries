import { afterNextRender, Component, computed, inject, input, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ExampleData } from '../content/content.models';
import { TrustedHtmlPipe } from '../content/trusted-html.pipe';
import { ExampleIsland } from './example-island';

/** A live example with tabs for its source files. */
@Component({
  selector: 'docs-example-viewer',
  imports: [ExampleIsland, TrustedHtmlPipe],
  template: `
    @let ex = example();
    <figure class="example" [attr.aria-labelledby]="'example-title-' + ex.id">
      <figcaption class="example-header">
        <div>
          <strong [id]="'example-title-' + ex.id">{{ ex.title }}</strong>
          @if (ex.description) {
            <span class="example-description">{{ ex.description }}</span>
          }
        </div>
        <div class="example-actions">
          <button type="button" class="tool" [attr.aria-pressed]="showCode()" (click)="showCode.set(!showCode())">
            <i class="fa-solid fa-code" aria-hidden="true"></i>
            {{ showCode() ? 'Hide code' : 'Show code' }}
          </button>
        </div>
      </figcaption>

      @if (showCode()) {
        <div class="code-panel">
          <div class="tabs" role="tablist" aria-label="Source files">
            @for (file of ex.files; track file.path; let i = $index) {
              <button
                type="button"
                role="tab"
                class="tab"
                [attr.aria-selected]="i === activeFile()"
                (click)="activeFile.set(i)"
              >
                {{ file.name }}
              </button>
            }
            <span class="spacer"></span>
            <button type="button" class="tool" (click)="copy()">
              <i class="fa-regular fa-copy" aria-hidden="true"></i> {{ copied() ? 'Copied' : 'Copy' }}
            </button>
            @if (current()?.url) {
              <a class="tool" [href]="current()!.url" target="_blank" rel="noopener">
                <i class="fa-brands fa-github" aria-hidden="true"></i> Source
              </a>
            }
          </div>
          <div class="code-block" role="tabpanel" [innerHTML]="current()?.html | trustedHtml"></div>
        </div>
      }

      @if (eager()) {
        <div class="example-canvas">
          <docs-example-island [exampleId]="ex.id" />
        </div>
      } @else {
        @defer (on viewport; on idle) {
          <div class="example-canvas">
            <docs-example-island [exampleId]="ex.id" />
          </div>
        } @placeholder {
          <div class="example-canvas is-placeholder" aria-hidden="true"></div>
        }
      }
    </figure>
  `,
  styleUrl: './example-viewer.scss',
})
export class ExampleViewer {
  private readonly document = inject(DOCUMENT);

  public readonly example = input.required<ExampleData>();
  protected readonly showCode = signal(false);
  protected readonly activeFile = signal(0);
  protected readonly copied = signal(false);
  protected readonly current = computed(() => this.example().files[this.activeFile()]);
  /**
   * `?examples=eager` starts every example at once instead of when it scrolls into view. For
   * automated checks, which run in pages the browser treats as hidden. Read after hydration, so
   * the prerendered markup stays the same.
   */
  protected readonly eager = signal(false);

  constructor() {
    afterNextRender(() => {
      this.eager.set(new URLSearchParams(this.document.location.search).get('examples') === 'eager');
    });
  }

  protected async copy(): Promise<void> {
    const pre = this.document.createElement('div');
    pre.innerHTML = this.current()?.html ?? '';
    await this.document.defaultView?.navigator.clipboard.writeText(pre.textContent ?? '');
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
