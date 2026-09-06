import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { marked } from 'marked';

/**
 * Loads the documentation Markdown that ships with the app and renders
 * it to HTML.
 *
 * The docs are static files under `public/help-docs/`, not API content.
 * That is what makes them versioned alongside the code that they
 * describe: a page and its explanation change in the same commit, and
 * the docs cannot drift out of sync with a deployment.
 *
 * <b>Trust.</b> The Markdown is ours, shipped in the bundle, and never
 * user-authored — which is the only reason `bypassSecurityTrustHtml` is
 * acceptable here. If these files ever become editable by users or come
 * from the API, this must switch to sanitised rendering; there is no
 * safe middle ground.
 */
@Injectable({ providedIn: 'root' })
export class HelpDocsService {
  private static readonly BASE_PATH = 'help-docs';

  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  /** Rendered documents, cached for the session — they never change. */
  private readonly cache = new Map<string, Observable<SafeHtml | null>>();

  /**
   * Renders one document, or emits null when the slug has no file.
   * Null is a normal outcome: the registry may name a doc before it is
   * written, and the page shows a friendly "not written yet" state
   * rather than an error.
   */
  load(slug: string): Observable<SafeHtml | null> {
    const safeSlug = this.normaliseSlug(slug);

    if (!safeSlug) {
      return of(null);
    }

    const cached = this.cache.get(safeSlug);

    if (cached) {
      return cached;
    }

    const request = this.http
      .get(`/${HelpDocsService.BASE_PATH}/${safeSlug}.md`, { responseType: 'text' })
      .pipe(
        map((markdown) => this.render(markdown)),
        catchError(() => of(null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.cache.set(safeSlug, request);

    return request;
  }

  private render(markdown: string): SafeHtml {
    const html = marked.parse(markdown, { async: false, gfm: true, breaks: false });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Slugs come from the registry, but they also arrive from the URL, so
   * they are constrained here rather than trusted: only lower-case
   * words and dashes, which cannot escape the docs directory.
   */
  private normaliseSlug(slug: string): string | null {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ? slug : null;
  }
}
