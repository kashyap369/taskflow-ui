import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  output,
} from '@angular/core';

/**
 * Accessible modal/drawer behaviour for a slide-in panel. Put `appDialog` on the panel element
 * (e.g. `<aside class="drawer" appDialog (dismiss)="close()">`). It:
 *  - marks the panel `role="dialog"` + `aria-modal="true"` + `tabindex="-1"`, and points
 *    `aria-labelledby` at the panel's first heading (creating an id if needed);
 *  - moves focus into the panel on open (first field, else the panel itself);
 *  - traps Tab / Shift+Tab within the panel;
 *  - emits `(dismiss)` on Escape so the host can close it;
 *  - restores focus to the element that was focused before it opened (the trigger).
 *
 * The panel is expected to be created/destroyed with `@if` (as the drawers are), so open = init and
 * close = destroy. Backdrop-click closing stays wired separately on the host.
 */
@Directive({
  selector: '[appDialog]',
  standalone: true,
})
export class DialogDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Emitted when the user presses Escape. */
  readonly dismiss = output<void>();

  private previouslyFocused: HTMLElement | null = null;

  private static readonly FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;

    this.previouslyFocused = (document.activeElement as HTMLElement) ?? null;

    if (!el.hasAttribute('role')) {
      el.setAttribute('role', 'dialog');
    }
    el.setAttribute('aria-modal', 'true');
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
    }

    if (!el.hasAttribute('aria-labelledby')) {
      const heading = el.querySelector<HTMLElement>('h1, h2, h3');
      if (heading) {
        if (!heading.id) {
          heading.id = `dlg-${Math.random().toString(36).slice(2, 9)}`;
        }
        el.setAttribute('aria-labelledby', heading.id);
      }
    }

    // Defer so the panel is laid out (offsetParent visible) before we pick a focus target.
    queueMicrotask(() => this.focusFirst());
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus?.();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismiss.emit();
      return;
    }
    if (event.key === 'Tab') {
      this.trapTab(event);
    }
  }

  /** Visible, focusable descendants in DOM order. */
  private focusable(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(DialogDirective.FOCUSABLE),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  private focusFirst(): void {
    const items = this.focusable();
    // Prefer the first form field over a leading close button — nicer for form drawers.
    const field = items.find((el) => /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
    (field ?? items[0] ?? this.host.nativeElement).focus();
  }

  private trapTab(event: KeyboardEvent): void {
    const items = this.focusable();
    if (items.length === 0) {
      event.preventDefault();
      this.host.nativeElement.focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
