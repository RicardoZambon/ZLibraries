import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MANIFEST } from '../content/manifest';

const DESCRIPTIONS: Record<string, string> = {
  library: 'Presentation components: form controls, data grid, modals, ribbon, sidebar, button.',
  framework: 'The application shell: tabbed navigation, view base classes, ribbon action buttons.',
  shared: 'Authentication, main and login layouts, top bar, theme, audit history.',
  testing: 'A harness that renders a component under an OnPush parent, for your own specs.',
};

/** Lists the entry points. */
@Component({
  selector: 'docs-api-index-page',
  imports: [RouterLink],
  template: `
    <header class="doc-header">
      <h1>API reference</h1>
      <p class="lede">Generated from the package source on every release. Each entry point is imported on its own.</p>
    </header>
    <div class="cards">
      @for (entryPoint of entryPoints; track entryPoint) {
        <a class="card" [routerLink]="['/api', entryPoint]">
          <code>&#64;zambon-dev/ui/{{ entryPoint }}</code>
          <span>{{ descriptions[entryPoint] }}</span>
        </a>
      }
    </div>
  `,
  styleUrl: './cards.scss',
})
export class ApiIndexPage {
  protected readonly entryPoints = MANIFEST.routes.api;
  protected readonly descriptions = DESCRIPTIONS;
}
