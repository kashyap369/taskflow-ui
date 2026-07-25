import { Signal, computed, signal } from '@angular/core';

/** Page sizes offered by default in the `Pagination` molecule's rows-per-page select. */
export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100] as const;

export interface PaginationOptions {
  /** Rows per page to start on (defaults to the first entry of `pageSizes`). */
  pageSize?: number;
  /** Selectable rows-per-page values; pass a single value to hide the select. */
  pageSizes?: readonly number[];
}

/**
 * A client-side pager over a source signal. Everything is derived, so the page slice tracks the
 * source automatically — including when filters shrink the list under the current page.
 */
export interface Pagination<T> {
  /** Current page (1-based), always clamped into `[1, totalPages]`. */
  readonly page: Signal<number>;
  readonly pageSize: Signal<number>;
  readonly pageSizes: readonly number[];
  /** Number of items in the (already filtered) source. */
  readonly total: Signal<number>;
  /** At least 1, so an empty list still reads as "page 1 of 1". */
  readonly totalPages: Signal<number>;
  /** The current page's slice of the source. */
  readonly items: Signal<T[]>;
  /** 1-based index of the first item on the page (0 when the source is empty). */
  readonly rangeStart: Signal<number>;
  /** 1-based index of the last item on the page (0 when the source is empty). */
  readonly rangeEnd: Signal<number>;
  setPage(page: number): void;
  next(): void;
  prev(): void;
  /** Changes rows-per-page and returns to the first page (the usual expectation). */
  setPageSize(size: number): void;
  /** Back to page 1 — call after a filter/search change if you want an explicit reset. */
  reset(): void;
}

/**
 * Creates a pager over `source` (typically a `computed()` of already-filtered rows).
 *
 * ```ts
 * readonly filtered = computed(() => …);
 * readonly pager = createPagination(this.filtered, { pageSize: 10 });
 * // template: @for (u of pager.items(); …)
 * ```
 *
 * The exposed `page` is a *computed clamp* rather than the raw writable, so a shrinking source
 * (someone types into the search box while on page 7) silently falls back to the last real page
 * instead of rendering an empty slice — no effect, no extra change-detection pass.
 */
export function createPagination<T>(
  source: Signal<readonly T[]>,
  options: PaginationOptions = {},
): Pagination<T> {
  const pageSizes = options.pageSizes ?? DEFAULT_PAGE_SIZES;
  const initialSize = options.pageSize ?? pageSizes[0] ?? 10;

  const requestedPage = signal(1);
  const pageSize = signal(Math.max(1, initialSize));

  const total = computed(() => source().length);
  const totalPages = computed(() => Math.max(1, Math.ceil(total() / pageSize())));
  const page = computed(() => Math.min(Math.max(1, requestedPage()), totalPages()));

  const items = computed(() => {
    const start = (page() - 1) * pageSize();
    return source().slice(start, start + pageSize()) as T[];
  });

  const rangeStart = computed(() => (total() === 0 ? 0 : (page() - 1) * pageSize() + 1));
  const rangeEnd = computed(() => Math.min(page() * pageSize(), total()));

  return {
    page,
    pageSize,
    pageSizes,
    total,
    totalPages,
    items,
    rangeStart,
    rangeEnd,
    setPage: (value: number) => requestedPage.set(Math.min(Math.max(1, value), totalPages())),
    next: () => requestedPage.set(Math.min(page() + 1, totalPages())),
    prev: () => requestedPage.set(Math.max(page() - 1, 1)),
    setPageSize: (size: number) => {
      pageSize.set(Math.max(1, size));
      requestedPage.set(1);
    },
    reset: () => requestedPage.set(1),
  };
}
