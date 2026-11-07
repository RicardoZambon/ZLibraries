import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Served by GitHub Pages for any unknown URL, as 404.html. */
@Component({
  selector: 'docs-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <p class="code">404</p>
      <h1>Page not found</h1>
      <p>The page you asked for does not exist, or it moved.</p>
      <p>
        <a routerLink="/">Home</a> · <a routerLink="/guides/getting-started">Getting started</a> ·
        <a routerLink="/api">API reference</a>
      </p>
    </div>
  `,
  styles: `
    .not-found {
      max-width: 36rem;
      margin: 4rem auto;
      text-align: center;
    }
    .code {
      margin: 0;
      color: var(--color-accent);
      font-size: 4rem;
      font-weight: var(--font-weight-strong);
    }
    a {
      color: var(--color-accent);
    }
  `,
})
export class NotFoundPage {}
