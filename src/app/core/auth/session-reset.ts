import { effect, inject, untracked } from '@angular/core';

import { AuthService } from './auth.service';

/**
 * Drop a facade's cached state whenever the signed-in principal changes.
 *
 * Every feature facade is a `providedIn: 'root'` singleton holding data scoped to **one** user, and
 * most guard their loader with a `_loaded` flag so `init()` is a no-op after the first call. Nothing
 * cleared that when a session ended — so signing out and back in as a different account left the
 * previous account's organizations, tasks and members on screen, and `init()` refused to refetch
 * them. That is both wrong and a small data leak between accounts.
 *
 * Call this from a facade's constructor (it needs an injection context) with a callback that resets
 * every signal the facade owns, `_loaded` flags included.
 *
 * It fires only when an **established** session ends or switches: the signed-out → signed-in
 * transition is deliberately ignored, because there is nothing stale to drop and resetting there
 * would race with the `init()` the destination page has already kicked off.
 */
export function resetOnSessionChange(reset: () => void): void {
  const auth = inject(AuthService);

  // Seeded from the current user so a rehydrated session (hard refresh) isn't treated as a change.
  let lastUserId = auth.user()?.id ?? null;

  effect(() => {
    const userId = auth.user()?.id ?? null;

    // The reset writes to signals; keep those writes out of this effect's dependency graph.
    untracked(() => {
      if (userId === lastUserId) {
        return;
      }
      const hadSession = lastUserId !== null;
      lastUserId = userId;
      if (hadSession) {
        reset();
      }
    });
  });
}
