import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { ApiData, PageData } from './content.models';

/**
 * Fetches the page data written by the content build.
 *
 * The URLs are relative to the base href, so they work under /ZLibraries/ and during prerender,
 * where Angular serves the build's own assets to these requests.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  public page(route: Signal<string | undefined>): HttpResourceRef<PageData | undefined> {
    return httpResource<PageData>(() => (route() ? `content/pages/${route()}.json` : undefined));
  }

  public api(entryPoint: Signal<string | undefined | null>): HttpResourceRef<ApiData | undefined> {
    return httpResource<ApiData>(() => (entryPoint() ? `content/api/${entryPoint()}.json` : undefined));
  }
}
