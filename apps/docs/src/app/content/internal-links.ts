import { Router } from '@angular/router';

/**
 * Routes clicks on links inside rendered Markdown through the router.
 *
 * The content's links are plain anchors relative to the base href, so they work without
 * JavaScript. With it, this keeps navigation inside the single-page app.
 */
export function followInternalLink(event: MouseEvent, router: Router): void {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const anchor = (event.target as HTMLElement).closest('a');
  const href = anchor?.getAttribute('href');
  if (!anchor || !href || anchor.target === '_blank' || /^[a-z]+:/i.test(href)) {
    return;
  }
  event.preventDefault();
  void router.navigateByUrl(href.startsWith('/') ? href : `/${href}`);
}
