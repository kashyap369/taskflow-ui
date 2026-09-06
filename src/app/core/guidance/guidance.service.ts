import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AuthStore } from '@core/auth/auth.store';

import { GuidanceProgressService } from './guidance-progress.service';
import { HELP_TOPICS, WELCOME_TOURS } from './guidance.registry';
import { HelpTopic } from './guidance.models';
import { TourService } from './tour.service';

/**
 * The single thing components ask about guidance: "where am I, what
 * help exists here, and should I be drawing attention to it?"
 *
 * Route matching is by pattern, so `/organization/projects/42` resolves
 * to the project-detail topic and `/organization/projects` to the list.
 * When several patterns match, the most specific wins — measured by how
 * many segments are literal rather than `:params`.
 *
 * Routes with no entry return null. That is deliberate and not a gap to
 * fill: the meeting room, the guest portal and the auth pages should
 * have no floating help button, and returning null is how they get it.
 */
@Injectable({ providedIn: 'root' })
export class GuidanceService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);
  private readonly tours = inject(TourService);

  readonly progress = inject(GuidanceProgressService);

  /**
   * Routes the launcher must never appear on. A floating button over
   * someone's video call is the clearest example — the call is
   * full-bleed and the button would sit on a participant's face.
   */
  private static readonly SUPPRESSED_PREFIXES = [
    '/organization/meetings/', // only the /room child, narrowed below
    '/meet/',
    '/guest/',
    '/auth/',
    '/login',
    '/register',
  ];

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** The topic for the page the user is on, or null if there is none. */
  readonly currentTopic = computed<HelpTopic | null>(() => {
    const url = this.stripQuery(this.url());

    if (this.isSuppressed(url)) {
      return null;
    }

    return this.matchTopic(url);
  });

  /** True while the current page's tour has never been seen or dismissed. */
  readonly shouldPrompt = computed(() => {
    const topic = this.currentTopic();
    return topic !== null && this.progress.shouldPrompt(topic.key);
  });

  /** Resolved sibling topics for the "related pages" row in the launcher. */
  readonly relatedTopics = computed<HelpTopic[]>(() => {
    const topic = this.currentTopic();

    if (!topic) {
      return [];
    }

    return topic.related
      .map((key) => this.topicByKey(key))
      .filter((related): related is HelpTopic => related !== null);
  });

  /** The welcome tour for this account type, or null once it has run. */
  readonly pendingWelcome = computed<HelpTopic | null>(() => {
    if (this.progress.hasSeenWelcome() || !this.auth.isAuthenticated()) {
      return null;
    }

    const portal = this.auth.portal();

    return portal === 'organization' ? WELCOME_TOURS.organization : WELCOME_TOURS.member;
  });

  topicByKey(key: string): HelpTopic | null {
    return HELP_TOPICS.find((topic) => topic.key === key) ?? null;
  }

  /** Topics for the documentation index, in registry order. */
  topicsForPortal(portal: 'organization' | 'member'): HelpTopic[] {
    return HELP_TOPICS.filter((topic) => topic.portal === portal || topic.portal === 'both');
  }

  startCurrentTour(): void {
    const topic = this.currentTopic();

    if (topic) {
      this.tours.start(topic);
    }
  }

  restartCurrentTour(): void {
    const topic = this.currentTopic();

    if (topic) {
      this.tours.restart(topic);
    }
  }

  /**
   * Runs the first-run welcome and records it, whether the user watches
   * it through or closes it — being shown the welcome once is the
   * promise, not being made to finish it.
   */
  startWelcome(): void {
    const welcome = this.pendingWelcome();

    if (!welcome) {
      return;
    }

    this.progress.completeWelcome();
    this.tours.start(welcome);
  }

  dismissWelcome(): void {
    this.progress.completeWelcome();
  }

  private matchTopic(url: string): HelpTopic | null {
    const segments = url.split('/').filter(Boolean);

    let best: HelpTopic | null = null;
    let bestScore = -1;

    for (const topic of HELP_TOPICS) {
      const pattern = topic.route.split('/').filter(Boolean);

      if (pattern.length !== segments.length) {
        continue;
      }

      let score = 0;
      let matched = true;

      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i].startsWith(':')) {
          continue; // Any single segment; contributes nothing to specificity.
        }

        if (pattern[i].toLowerCase() !== segments[i].toLowerCase()) {
          matched = false;
          break;
        }

        score++;
      }

      if (matched && score > bestScore) {
        best = topic;
        bestScore = score;
      }
    }

    return best;
  }

  private isSuppressed(url: string): boolean {
    // The meeting *room* is full-bleed video and must stay clear; the
    // meeting detail page underneath it is an ordinary page and keeps
    // its help.
    if (url.endsWith('/room')) {
      return true;
    }

    return GuidanceService.SUPPRESSED_PREFIXES.filter((prefix) => prefix !== '/organization/meetings/')
      .some((prefix) => url.startsWith(prefix));
  }

  private stripQuery(url: string): string {
    const cut = url.search(/[?#]/);
    return cut === -1 ? url : url.slice(0, cut);
  }
}
