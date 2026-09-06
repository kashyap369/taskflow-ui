import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthStore } from '@core/auth/auth.store';

import { EMPTY_PROGRESS, GuidanceProgress } from './guidance.models';

/**
 * Remembers which tours a user has seen.
 *
 * Storage is namespaced per user id, so two accounts sharing a browser
 * do not inherit each other's progress — signing in as a colleague to
 * reproduce a bug should not mark their onboarding done. Signed-out
 * state falls back to a shared `anon` bucket, which only matters for
 * the public pages the launcher does not run on anyway.
 *
 * Every read is defensive. `localStorage` throws in private-mode Safari
 * and when a browser blocks site data, and the stored JSON may be from
 * an older shape or hand-edited; in all of those cases we behave as a
 * brand-new user rather than breaking the page the launcher sits on.
 */
@Injectable({ providedIn: 'root' })
export class GuidanceProgressService {
  private static readonly STORAGE_PREFIX = 'taskflow.guidance.v1';

  private readonly auth = inject(AuthStore);

  private readonly state = signal<GuidanceProgress>(EMPTY_PROGRESS);

  /** The current user's progress. Reload it when the principal changes. */
  readonly progress = this.state.asReadonly();

  readonly promptsEnabled = computed(() => this.state().promptsEnabled);

  readonly hasSeenWelcome = computed(() => this.state().welcomeCompletedAt !== null);

  constructor() {
    this.reload();
  }

  /**
   * Re-reads storage for the current principal. Call after login and
   * after logout — the service cannot watch the store itself without
   * creating a circular dependency with the auth bootstrap.
   */
  reload(): void {
    this.state.set(this.read());
  }

  isCompleted(tourKey: string): boolean {
    return this.state().completed.includes(tourKey);
  }

  isDismissed(tourKey: string): boolean {
    return this.state().dismissed.includes(tourKey);
  }

  /** True when the user has neither finished nor waved away this tour. */
  isUnseen(tourKey: string): boolean {
    return !this.isCompleted(tourKey) && !this.isDismissed(tourKey);
  }

  /**
   * Whether the launcher should draw attention to itself on this page:
   * an unseen tour, and the user has not switched the nudges off.
   */
  shouldPrompt(tourKey: string): boolean {
    return this.promptsEnabled() && this.isUnseen(tourKey);
  }

  completeTour(tourKey: string): void {
    const current = this.state();

    this.write({
      ...current,
      // Finishing a tour supersedes having dismissed it earlier.
      dismissed: current.dismissed.filter((key) => key !== tourKey),
      completed: current.completed.includes(tourKey)
        ? current.completed
        : [...current.completed, tourKey],
    });
  }

  dismissTour(tourKey: string): void {
    const current = this.state();

    // A tour already completed stays completed — closing a replay is
    // not the user changing their mind about having seen it.
    if (current.completed.includes(tourKey) || current.dismissed.includes(tourKey)) {
      return;
    }

    this.write({ ...current, dismissed: [...current.dismissed, tourKey] });
  }

  /** Forgets one tour, so it behaves as if never seen. */
  resetTour(tourKey: string): void {
    const current = this.state();

    this.write({
      ...current,
      completed: current.completed.filter((key) => key !== tourKey),
      dismissed: current.dismissed.filter((key) => key !== tourKey),
    });
  }

  /**
   * Clean slate, including the welcome flow. Leaves `promptsEnabled`
   * alone: a user who turned the nudges off and then replays tours by
   * hand has not asked to be nudged again.
   */
  resetAll(): void {
    this.write({ ...this.state(), ...EMPTY_PROGRESS, promptsEnabled: this.promptsEnabled() });
  }

  completeWelcome(): void {
    const current = this.state();

    if (current.welcomeCompletedAt !== null) {
      return;
    }

    this.write({ ...current, welcomeCompletedAt: new Date().toISOString() });
  }

  setPromptsEnabled(enabled: boolean): void {
    this.write({ ...this.state(), promptsEnabled: enabled });
  }

  private storageKey(): string {
    const userId = this.auth.user()?.id;
    return `${GuidanceProgressService.STORAGE_PREFIX}.${userId ?? 'anon'}`;
  }

  private read(): GuidanceProgress {
    try {
      const raw = localStorage.getItem(this.storageKey());

      if (!raw) {
        return EMPTY_PROGRESS;
      }

      const parsed: unknown = JSON.parse(raw);

      if (typeof parsed !== 'object' || parsed === null) {
        return EMPTY_PROGRESS;
      }

      const candidate = parsed as Partial<GuidanceProgress>;

      // Field by field rather than a cast: stored JSON is user-editable
      // and may predate a change to the shape.
      return {
        completed: this.stringArray(candidate.completed),
        dismissed: this.stringArray(candidate.dismissed),
        welcomeCompletedAt:
          typeof candidate.welcomeCompletedAt === 'string' ? candidate.welcomeCompletedAt : null,
        promptsEnabled: candidate.promptsEnabled !== false,
      };
    } catch {
      return EMPTY_PROGRESS;
    }
  }

  private write(next: GuidanceProgress): void {
    this.state.set(next);

    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(next));
    } catch {
      // Storage unavailable or full. The in-memory signal still holds
      // for this session, so the tour will not replay behind the user
      // mid-visit; it simply will not survive a reload.
    }
  }

  private stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }
}
