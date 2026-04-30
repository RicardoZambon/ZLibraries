import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe that bypasses Angular's built-in HTML sanitization.
 *
 * **WARNING: This pipe introduces XSS (Cross-Site Scripting) risk.**
 * It marks the provided HTML string as trusted, meaning Angular will
 * render it without any sanitization. Malicious content such as
 * `<script>` tags, inline event handlers (`onerror`, `onclick`, etc.),
 * and `javascript:` URLs will be executed in the user's browser.
 *
 * ### Safe usage
 * - Server-rendered HTML from **trusted, internal APIs** that never
 *   include user-generated content (e.g., admin-authored rich text
 *   that is sanitized server-side before storage).
 * - Static HTML snippets defined in application code.
 *
 * ### Unsafe usage (DO NOT use for these)
 * - Any value that originates from user input (form fields, query
 *   params, URL fragments, file uploads).
 * - Third-party API responses whose content you do not control.
 * - Database fields that may contain unsanitized user submissions.
 *
 * @example
 * // Safe — trusted server content
 * <div [innerHTML]="trustedServerHtml | bypassHtmlSanitizer"></div>
 *
 * // UNSAFE — user-provided content (use Angular’s default sanitization instead)
 * <div [innerHTML]="comment.body | bypassHtmlSanitizer"></div>  // ❌ XSS risk
 * <div [innerHTML]="comment.body"></div>                        // ✅ Angular sanitizes automatically
 */
@Pipe({
  name: 'bypassHtmlSanitizer'
})
export class BypassHtmlSanitizerPipe implements PipeTransform {
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  public transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
