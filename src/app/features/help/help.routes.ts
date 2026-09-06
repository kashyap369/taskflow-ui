import { Routes } from '@angular/router';

/**
 * The documentation section. Mounted inside each portal rather than at
 * the application root, so reading the docs keeps the sidebar, the
 * workspace switcher and the user's sense of place — leaving the shell
 * to read a help page is disorienting, and makes coming back a
 * navigation problem.
 *
 * The canonical `/help` and `/help/:slug` URLs redirect into whichever
 * portal the reader belongs to; see `app.routes.ts`.
 */
export const HELP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./help-index-page/help-index-page').then((m) => m.HelpIndexPage),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./help-article-page/help-article-page').then((m) => m.HelpArticlePage),
  },
];
