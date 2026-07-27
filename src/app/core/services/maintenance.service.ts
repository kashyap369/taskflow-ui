import { Injectable, computed, signal } from '@angular/core';

/**
 * Holds the platform's maintenance state, as reported by the API.
 *
 * While an admin has `maintenanceMode` on, **every** non-admin request comes back **503
 * `MAINTENANCE_MODE`** carrying the admin's message. That is not a per-request failure the user can
 * retry their way out of — it's a state of the whole platform — so `errorInterceptor` records it
 * here (once) and the app root renders a persistent banner, instead of firing one toast per
 * in-flight request.
 *
 * Any successful response clears it, so the banner disappears the moment the platform is back.
 */
@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly _message = signal<string | null>(null);

  /** The admin's maintenance message, or null when the platform is up. */
  readonly message = this._message.asReadonly();
  readonly isDown = computed(() => this._message() !== null);

  /** Called by `errorInterceptor` on a 503 `MAINTENANCE_MODE`. Idempotent. */
  enter(message: string): void {
    if (this._message() !== message) {
      this._message.set(message);
    }
  }

  /** Called on any successful response — the platform answered, so it isn't down any more. */
  clear(): void {
    if (this._message() !== null) {
      this._message.set(null);
    }
  }
}
