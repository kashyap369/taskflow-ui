import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pagination } from './pagination';

describe('Pagination', () => {
  let component: Pagination;
  let fixture: ComponentFixture<Pagination>;

  const setInputs = (page: number, pageSize: number, total: number) => {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Pagination] }).compileComponents();
    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    setInputs(1, 10, 42);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('derives the page count and the shown range', () => {
    expect(component.totalPages()).toBe(5);
    expect(component.rangeStart()).toBe(1);
    expect(component.rangeEnd()).toBe(10);

    setInputs(5, 10, 42);
    expect(component.rangeStart()).toBe(41);
    expect(component.rangeEnd()).toBe(42);
  });

  it('reports an empty range when there is nothing to page', () => {
    setInputs(1, 10, 0);
    expect(component.totalPages()).toBe(1);
    expect(component.rangeStart()).toBe(0);
    expect(component.rangeEnd()).toBe(0);
  });

  it('lists every page when they fit inside the button budget', () => {
    setInputs(1, 10, 42);
    expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses the middle with ellipsis sentinels on long lists', () => {
    setInputs(6, 10, 120); // 12 pages
    expect(component.pages()).toEqual([1, 0, 5, 6, 7, 0, 12]);

    setInputs(1, 10, 120);
    expect(component.pages()).toEqual([1, 2, 3, 4, 0, 12]);

    setInputs(12, 10, 120);
    expect(component.pages()).toEqual([1, 0, 9, 10, 11, 12]);
  });

  it('disables the nav buttons at the ends', () => {
    setInputs(1, 10, 42);
    expect(component.isFirst()).toBeTrue();
    expect(component.isLast()).toBeFalse();

    setInputs(5, 10, 42);
    expect(component.isFirst()).toBeFalse();
    expect(component.isLast()).toBeTrue();
  });

  it('emits pageChange only for a different, in-range page', () => {
    const emitted: number[] = [];
    component.pageChange.subscribe((p) => emitted.push(p));

    setInputs(2, 10, 42);
    component.goTo(2); // same page
    component.goTo(0); // below range
    component.goTo(99); // above range
    component.next();
    component.prev();

    expect(emitted).toEqual([3, 1]);
  });

  it('emits the new page size as a number', () => {
    const emitted: number[] = [];
    component.pageSizeChange.subscribe((s) => emitted.push(s));

    component.onPageSize('25');

    expect(emitted).toEqual([25]);
  });

  it('marks the current page button with aria-current', () => {
    setInputs(3, 10, 42);
    const current: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('3');
  });

  it('hides the rows-per-page select unless there is a choice', () => {
    expect(component.showPageSizes()).toBeFalse();

    fixture.componentRef.setInput('pageSizes', [10, 25]);
    fixture.detectChanges();

    expect(component.showPageSizes()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.page-size select')).toBeTruthy();
  });
});
