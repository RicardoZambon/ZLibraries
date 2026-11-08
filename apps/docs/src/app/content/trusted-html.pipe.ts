import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Marks HTML from the content build as trusted.
 *
 * The content comes only from this repository's Markdown, rendered at build time. The default
 * sanitizer would strip the inline colour variables the code highlighter writes.
 */
@Pipe({ name: 'trustedHtml' })
export class TrustedHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  public transform(html: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html ?? '');
  }
}
