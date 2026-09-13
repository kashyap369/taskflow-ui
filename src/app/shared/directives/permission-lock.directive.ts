import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * Marks an action the signed-in member is not allowed to perform. Instead of hiding the control
 * (the older `@if (canManageX())` pattern), the control stays on screen, reads as disabled and
 * carries a small lock badge — so a member can see the action exists and understands *why* it is
 * unavailable rather than wondering where it went.
 *
 * Usage:
 *   <button appLocked [appLocked]="!canManageTasks()" class="btn btn--primary">New task</button>
 *   <button [appLocked]="!canManageMembers()" lockedReason="Ask an owner for Manage members.">…</button>
 *
 * It also covers form controls — `<select>`, `<input>`, `<textarea>` — which is what an inline
 * assignee or team dropdown is. Those need more than a blocked click: a select opens on
 * `mousedown` and on arrow keys, so a member could pick a name, watch the row change, and only
 * then be told by a toast that the API refused. Both routes are blocked here, and any change that
 * still slips through is reverted, so the control never shows a value the server did not accept.
 *
 * Notes:
 *  - It uses `aria-disabled`, not the native `disabled` attribute, on purpose: a natively disabled
 *    control is unfocusable and shows no tooltip, so the member never learns the reason. The click
 *    is blocked here instead, on a capture-phase listener that runs before the template's own
 *    `(click)` handler.
 *  - The badge is appended inside the host, except on a form control, where only `<option>` may be
 *    a child — there it goes next to the control and the parent carries the positioning.
 *  - This is a usability gate only. The API repeats every one of these checks and stays
 *    authoritative — see the facade's `canManage*` computeds.
 */
@Directive({
  selector: '[appLocked]',
  standalone: true,
})
export class PermissionLockDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  /** True when the action is locked for this member. */
  readonly appLocked = input(false, { transform: booleanAttribute });

  /** Tooltip shown on the locked control. */
  readonly lockedReason = input<string>(
    "You don't have permission for this action. Ask an organization owner to grant it.",
  );

  private badge: HTMLElement | null = null;
  /** Set only while locked, so unlocking restores whatever the template had. */
  private previousTitle: string | null = null;

  /** A form control cannot hold the badge as a child, and opens on more than a click. */
  private readonly isFormControl: boolean;

  constructor() {
    const el = this.host.nativeElement;

    this.isFormControl = ['SELECT', 'INPUT', 'TEXTAREA'].includes(el.tagName);

    // Capture phase: this runs before the bubble-phase `(click)` the template binds, so a locked
    // control never reaches its handler.
    el.addEventListener('click', this.block, true);
    el.addEventListener('keydown', this.blockKey, true);

    if (this.isFormControl) {
      // `mousedown` is what opens a native select — by the time `click` fires the list is
      // already down. `change` is the backstop for anything that still gets through
      // (a touch device's picker, an autofill, a scripted value).
      el.addEventListener('mousedown', this.block, true);
      el.addEventListener('change', this.blockChange, true);
    }

    effect(() => (this.appLocked() ? this.lock() : this.unlock()));
  }

  private readonly block = (event: Event): void => {
    if (!this.appLocked()) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private readonly blockKey = (event: KeyboardEvent): void => {
    if (!this.appLocked()) {
      return;
    }

    // Tab must still work: the control stays reachable so its tooltip can be read.
    const opensTheControl =
      event.key === 'Enter' ||
      event.key === ' ' ||
      (this.isFormControl && event.key.startsWith('Arrow'));

    if (opensTheControl) {
      this.block(event);
    }
  };

  /**
   * Last line of defence on a form control: put the value back and stop the template's own
   * `(change)` handler from firing, so a locked row never shows an assignment the API refused.
   */
  private readonly blockChange = (event: Event): void => {
    if (!this.appLocked()) {
      return;
    }

    event.stopImmediatePropagation();

    const el = this.host.nativeElement;

    if (el instanceof HTMLSelectElement) {
      // The template renders `[selected]` from the model, so re-reading the options restores
      // whatever the server last confirmed.
      const original = Array.from(el.options).findIndex((option) => option.defaultSelected);
      el.selectedIndex = original === -1 ? 0 : original;
    }
  };

  private lock(): void {
    const el = this.host.nativeElement;

    this.renderer.addClass(el, 'is-permission-locked');
    this.renderer.setAttribute(el, 'aria-disabled', 'true');

    if (this.previousTitle === null) {
      this.previousTitle = el.getAttribute('title') ?? '';
    }
    this.renderer.setAttribute(el, 'title', this.lockedReason());

    if (!this.badge) {
      this.badge = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(this.badge, 'permission-lock-badge');
      this.renderer.setAttribute(this.badge, 'aria-hidden', 'true');
      this.renderer.setProperty(this.badge, 'innerHTML', LOCK_SVG);

      const parent = el.parentElement;

      if (this.isFormControl && parent) {
        // Only `<option>` may live inside a select, so the badge goes beside the control and
        // the parent becomes the positioning context.
        this.renderer.addClass(parent, 'has-permission-lock');
        this.renderer.insertBefore(parent, this.badge, el.nextSibling);
      } else {
        this.renderer.appendChild(el, this.badge);
      }
    }
  }

  private unlock(): void {
    const el = this.host.nativeElement;

    this.renderer.removeClass(el, 'is-permission-locked');
    this.renderer.removeAttribute(el, 'aria-disabled');

    if (this.previousTitle !== null) {
      if (this.previousTitle) {
        this.renderer.setAttribute(el, 'title', this.previousTitle);
      } else {
        this.renderer.removeAttribute(el, 'title');
      }
      this.previousTitle = null;
    }

    if (this.badge) {
      const parent = el.parentElement;

      if (this.isFormControl && parent) {
        this.renderer.removeClass(parent, 'has-permission-lock');
        this.renderer.removeChild(parent, this.badge);
      } else {
        this.renderer.removeChild(el, this.badge);
      }

      this.badge = null;
    }
  }
}

/** Lucide `Lock`, inlined — the directive builds its badge in DOM, outside any template. */
const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
