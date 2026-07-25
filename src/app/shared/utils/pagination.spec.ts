import { signal } from '@angular/core';

import { createPagination } from './pagination';

describe('createPagination', () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

  it('slices the source into pages', () => {
    const source = signal(rows(25));
    const pager = createPagination(source, { pageSize: 10 });

    expect(pager.total()).toBe(25);
    expect(pager.totalPages()).toBe(3);
    expect(pager.items()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    pager.next();
    expect(pager.page()).toBe(2);
    expect(pager.items()).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

    pager.setPage(3);
    expect(pager.items()).toEqual([21, 22, 23, 24, 25]);
  });

  it('reports a human 1-based range and 0 when empty', () => {
    const source = signal(rows(25));
    const pager = createPagination(source, { pageSize: 10 });

    expect(pager.rangeStart()).toBe(1);
    expect(pager.rangeEnd()).toBe(10);

    pager.setPage(3);
    expect(pager.rangeStart()).toBe(21);
    expect(pager.rangeEnd()).toBe(25);

    source.set([]);
    expect(pager.rangeStart()).toBe(0);
    expect(pager.rangeEnd()).toBe(0);
    expect(pager.totalPages()).toBe(1);
    expect(pager.items()).toEqual([]);
  });

  it('clamps out-of-range page requests', () => {
    const pager = createPagination(signal(rows(25)), { pageSize: 10 });

    pager.setPage(99);
    expect(pager.page()).toBe(3);

    pager.setPage(0);
    expect(pager.page()).toBe(1);

    pager.prev();
    expect(pager.page()).toBe(1);
  });

  it('falls back to the last real page when the source shrinks under it', () => {
    const source = signal(rows(25));
    const pager = createPagination(source, { pageSize: 10 });

    pager.setPage(3);
    expect(pager.page()).toBe(3);

    // e.g. the user typed into the search box while sitting on the last page
    source.set(rows(4));
    expect(pager.page()).toBe(1);
    expect(pager.items()).toEqual([1, 2, 3, 4]);

    // and re-widening the filter restores the requested page
    source.set(rows(25));
    expect(pager.page()).toBe(3);
  });

  it('returns to page 1 when the page size changes', () => {
    const pager = createPagination(signal(rows(25)), { pageSize: 10 });

    pager.setPage(3);
    pager.setPageSize(25);

    expect(pager.page()).toBe(1);
    expect(pager.totalPages()).toBe(1);
    expect(pager.items().length).toBe(25);
  });

  it('defaults the page size to the first offered size', () => {
    const pager = createPagination(signal(rows(30)), { pageSizes: [5, 15] });

    expect(pager.pageSize()).toBe(5);
    expect(pager.totalPages()).toBe(6);
  });

  it('resets to the first page on demand', () => {
    const pager = createPagination(signal(rows(25)), { pageSize: 10 });

    pager.setPage(2);
    pager.reset();

    expect(pager.page()).toBe(1);
  });
});
