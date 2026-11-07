import { RenderMode, ServerRoute } from '@angular/ssr';
import { MANIFEST } from './content/manifest';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'guides/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => MANIFEST.routes.guides.map((slug) => ({ slug })),
  },
  { path: 'components', renderMode: RenderMode.Prerender },
  {
    path: 'components/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => MANIFEST.routes.components.map((slug) => ({ slug })),
  },
  { path: 'api', renderMode: RenderMode.Prerender },
  {
    path: 'api/:entryPoint',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => MANIFEST.routes.api.map((entryPoint) => ({ entryPoint })),
  },
  { path: 'changelog', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
