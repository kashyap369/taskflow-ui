/**
 * Types for the in-app guidance system: the help launcher, the page
 * tours it runs, and the documentation it links into.
 *
 * The whole feature is driven by one catalogue (`guidance.registry.ts`).
 * Adding help for a new page is a single entry there — the launcher, the
 * sidebar docs and the "related pages" links all read from it, so there
 * is no second place to keep in sync.
 */

/** Where a tour popover sits relative to its anchor. */
export type TourSide = 'top' | 'right' | 'bottom' | 'left';

export type TourAlign = 'start' | 'center' | 'end';

export interface TourStep {
  /**
   * CSS selector for the element this step points at. Omit it for a
   * centred modal step — used for the opening "what this page is for"
   * card, and for closing steps that summarise rather than point.
   *
   * Selectors are resolved when the step is reached, not when the tour
   * starts, so a step may target something that only appears part way
   * through. A selector that matches nothing is skipped rather than
   * breaking the tour (see TourService).
   */
  readonly element?: string;

  readonly title: string;

  /** Plain sentences. Keep to two or three — this is a nudge, not a manual. */
  readonly description: string;

  readonly side?: TourSide;

  readonly align?: TourAlign;
}

/** Which portal a topic belongs to, so the launcher offers the right help. */
export type GuidancePortal = 'organization' | 'member' | 'both';

export interface HelpTopic {
  /**
   * Stable identifier, dot-separated and lower-case
   * (`org.projects`, `member.my-tasks`). Progress is stored against
   * this, so renaming a key makes every user see that tour again —
   * change it only when the page's meaning really changed.
   */
  readonly key: string;

  /**
   * Route pattern this topic covers. `:param` matches one path segment.
   * When several patterns match the current URL the most specific one
   * (most non-parameter segments) wins, so `/organization/projects/:id`
   * beats `/organization/projects`.
   */
  readonly route: string;

  /** Page name as shown in the launcher and the docs index. */
  readonly label: string;

  /** Lucide icon name, matching the sidebar icon for the same page. */
  readonly icon: string;

  /** One line, shown under the title in the launcher popover. */
  readonly summary: string;

  /**
   * Markdown file under `assets/help/`, without the extension. Several
   * topics may share a doc — the project list and a single project are
   * one subject to read about, even though they tour separately.
   */
  readonly docSlug: string;

  /**
   * Keys of topics worth reading next. This is the part that teaches
   * how TaskFlow fits together: a Project links to Tasks and Teams, a
   * Team links to Roles and Members. Keys that do not resolve are
   * ignored, so a half-written registry never breaks the UI.
   */
  readonly related: readonly string[];

  readonly portal: GuidancePortal;

  readonly tour: readonly TourStep[];
}

/**
 * What the user has seen. Persisted per user in `localStorage`.
 *
 * Deliberately client-side: the server has no onboarding table, and the
 * cost of that choice is that clearing site data or moving to another
 * browser offers the tours again. Every tour is dismissible and none
 * auto-plays more than once per page, so the worst case is one extra
 * nudge — not a broken experience.
 */
export interface GuidanceProgress {
  /** Tour keys run to the final step. */
  readonly completed: readonly string[];

  /**
   * Tour keys closed early or declined. Separate from `completed`
   * because they mean different things: a dismissed tour still appears
   * in the launcher, it just stops nudging.
   */
  readonly dismissed: readonly string[];

  /** ISO timestamp of the first-run welcome flow, or null if never run. */
  readonly welcomeCompletedAt: string | null;

  /**
   * When false the launcher stops expanding itself and stops pulsing.
   * It stays available and every tour can still be started by hand —
   * this is "stop nudging me", not "hide help".
   */
  readonly promptsEnabled: boolean;
}

export const EMPTY_PROGRESS: GuidanceProgress = {
  completed: [],
  dismissed: [],
  welcomeCompletedAt: null,
  promptsEnabled: true,
};
