import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';

interface PagefindUiConstructor {
  new (options: Record<string, unknown>): unknown;
}

/**
 * Full-text search over the prerendered pages, with Pagefind.
 *
 * The index is built after the site is prerendered, so it only exists in a built site. The UI
 * script loads the first time the dialog opens.
 */
@Component({
  selector: 'docs-search-dialog',
  template: `
    <button type="button" class="search-trigger" (click)="open()" aria-haspopup="dialog">
      <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      <span class="label">Search</span>
      <kbd>/</kbd>
    </button>
    <!-- The backdrop click closes the dialog; Escape does the same natively. -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog #dialog class="search-dialog" aria-label="Search the documentation" (click)="onBackdrop($event)">
      <div class="search-panel">
        <div #results class="search-results"></div>
        @if (failed()) {
          <p class="search-failed">Search is available on the built site only.</p>
        }
      </div>
    </dialog>
  `,
  styleUrl: './search-dialog.scss',
})
export class SearchDialog {
  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly results = viewChild.required<ElementRef<HTMLElement>>('results');
  private loaded = false;
  protected readonly failed = signal(false);

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (event.key === '/' && !typing) {
      event.preventDefault();
      this.open();
    }
  }

  protected async open(): Promise<void> {
    this.dialog().nativeElement.showModal();
    if (!this.loaded) {
      this.loaded = true;
      await this.loadPagefind();
    }
    this.results().nativeElement.querySelector<HTMLInputElement>('input')?.focus();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.dialog().nativeElement.close();
    }
  }

  private async loadPagefind(): Promise<void> {
    const base = new URL(this.document.baseURI).pathname;
    try {
      const link = this.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${base}pagefind/pagefind-ui.css`;
      this.document.head.appendChild(link);
      await new Promise<void>((resolve, reject) => {
        const script = this.document.createElement('script');
        script.src = `${base}pagefind/pagefind-ui.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Pagefind is not available'));
        this.document.head.appendChild(script);
      });
      const PagefindUI = (this.document.defaultView as unknown as { PagefindUI: PagefindUiConstructor }).PagefindUI;
      new PagefindUI({
        element: this.results().nativeElement,
        baseUrl: base,
        showSubResults: true,
        showImages: false,
        resetStyles: false,
        autofocus: true,
      });
      // Pagefind renders plain links. Close the dialog when one is followed.
      this.results().nativeElement.addEventListener('click', (event) => {
        if ((event.target as HTMLElement).closest('a')) this.dialog().nativeElement.close();
      });
    } catch {
      this.failed.set(true);
    }
  }
}
