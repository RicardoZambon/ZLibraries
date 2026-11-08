import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home-page').then((m) => m.HomePage), title: 'ZLibraries' },
  {
    path: 'guides/:slug',
    loadComponent: () => import('./pages/doc-page').then((m) => m.DocPage),
    data: { section: 'guides' },
  },
  {
    path: 'components',
    loadComponent: () => import('./pages/components-index-page').then((m) => m.ComponentsIndexPage),
    title: 'Components · ZLibraries',
  },
  {
    path: 'components/:slug',
    loadComponent: () => import('./pages/doc-page').then((m) => m.DocPage),
    data: { section: 'components' },
  },
  {
    path: 'api',
    loadComponent: () => import('./pages/api-index-page').then((m) => m.ApiIndexPage),
    title: 'API reference · ZLibraries',
  },
  { path: 'api/:entryPoint', loadComponent: () => import('./pages/api-page').then((m) => m.ApiPage) },
  {
    path: 'changelog',
    loadComponent: () => import('./pages/doc-page').then((m) => m.DocPage),
    data: { route: 'changelog' },
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
    title: 'Page not found · ZLibraries',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
    title: 'Page not found · ZLibraries',
  },
];
