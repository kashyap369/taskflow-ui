import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import {
  ChevronLeft,
  ChevronRight,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
} from 'lucide-angular';

/** Sentinel emitted by `pages()` for a gap in the windowed page list ("…"). */
const ELLIPSIS = 0;

/**
 * Accessible pager for list views — a "Showing 1–10 of 42 tasks" summary, an optional
 * rows-per-page select, and a windowed page list with prev/next.
 *
 * Presentational only: it derives the page window from `page`/`pageSize`/`total` and emits
 * intent. Pair it with `createPagination()` from `@shared/utils/pagination` for the state.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ ChevronLeft, ChevronRight }),
    },
  ],
})
export class Pagination {
  /** Current page, 1-based. */
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  /** Total rows across all pages (after filtering). */
  readonly total = input.required<number>();
  /** Rows-per-page choices; one (or none) hides the select. */
  readonly pageSizes = input<readonly number[]>([]);
  /** Plural noun used in the summary line, e.g. "tasks". */
  readonly itemLabel = input('items');
  /** `aria-label` for the surrounding `<nav>`. */
  readonly ariaLabel = input('Pagination');
  /** How many page buttons to show before collapsing the middle into an ellipsis. */
  readonly maxPageButtons = input(7);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly ellipsis = ELLIPSIS;

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  readonly rangeStart = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  readonly isFirst = computed(() => this.page() <= 1);
  readonly isLast = computed(() => this.page() >= this.totalPages());

  /** Show the rows-per-page select only when there is a real choice to make. */
  readonly showPageSizes = computed(() => this.pageSizes().length > 1);

  /**
   * The page buttons to render: first and last always, a sibling window around the current page,
   * and `ELLIPSIS` for the collapsed gaps (e.g. `1 … 4 5 6 … 12`).
   */
  readonly pages = computed<number[]>(() => {
    const last = this.totalPages();
    const current = this.page();
    const max = Math.max(5, this.maxPageButtons());

    if (last <= max) {
      return Array.from({ length: last }, (_, i) => i + 1);
    }

    // Reserve first + last + two ellipses; the rest is the window around the current page.
    const window = max - 4;
    const half = Math.floor(window / 2);
    let start = Math.max(2, current - half);
    let end = Math.min(last - 1, start + window - 1);
    start = Math.max(2, end - window + 1);

    const result: number[] = [1];
    if (start > 2) {
      result.push(ELLIPSIS);
    }
    for (let p = start; p <= end; p++) {
      result.push(p);
    }
    if (end < last - 1) {
      result.push(ELLIPSIS);
    }
    result.push(last);
    return result;
  });

  goTo(page: number): void {
    if (page !== this.page() && page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  prev(): void {
    this.goTo(this.page() - 1);
  }

  next(): void {
    this.goTo(this.page() + 1);
  }

  onPageSize(value: string): void {
    this.pageSizeChange.emit(Number(value));
  }
}
