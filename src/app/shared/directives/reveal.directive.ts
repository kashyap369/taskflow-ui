import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';

/**
 * Scroll-reveal: the element starts hidden (styled by `[data-reveal]` in
 * _motion.scss) and animates in the first time it scrolls into view.
 *
 * Usage:
 *   <div appReveal>…</div>
 *   <div appReveal="left" [revealDelay]="120">…</div>   // direction + stagger (ms)
 *
 * The directive sets the `data-reveal` attribute (so the CSS starting state
 * applies) and toggles `.is-visible` via IntersectionObserver. See docs/DESIGN.md §5.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** '' | 'up' (default) | 'left' | 'right' | 'scale' */
  readonly appReveal = input<string>('');

  /** Stagger delay in milliseconds. */
  readonly revealDelay = input<number>(0);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;

    el.setAttribute('data-reveal', this.appReveal() || 'up');

    const delay = this.revealDelay();
    if (delay > 0) {
      el.style.setProperty('--reveal-delay', `${delay}ms`);
    }

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
