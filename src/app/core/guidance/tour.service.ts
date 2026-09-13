import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { Driver, DriveStep, driver } from 'driver.js';
import { filter } from 'rxjs';

import { GuidanceProgressService } from './guidance-progress.service';
import { HelpTopic, TourStep } from './guidance.models';

/**
 * Runs page tours with driver.js and records the outcome.
 *
 * Two behaviours are worth knowing about before changing this:
 *
 * 1. **A missing anchor never breaks a tour.** Selectors are resolved
 *    at start time; a step whose element is not on the page (an empty
 *    state hiding the table, a control the user's role cannot see)
 *    keeps its text and becomes a centred card instead of being
 *    dropped. The explanation is the point — the highlight is a bonus.
 *
 * 2. **Closing early is a dismissal, reaching the end is a completion.**
 *    They are recorded separately because the launcher treats them
 *    differently: a dismissed tour stops nudging but stays on offer.
 *
 * 3. **A tour never outlives the page it explains.** driver.js puts
 *    `driver-active` on `<body>`, and its stylesheet turns that into
 *    `.driver-active * { pointer-events: none }` — everything on the
 *    page stops taking clicks except the highlighted element and the
 *    popover. That is correct while a tour is on screen and a hard
 *    lock-out the moment it is not, which is exactly what a route
 *    change used to produce: the tour kept running, its anchor was
 *    unmounted with the old page, and the popover that was the only
 *    way out went with it. The page then looked normal and ignored
 *    every click until a reload. Hence {@link stop} on navigation, and
 *    {@link releaseOverlay} as the backstop that guarantees the class
 *    can never be left behind whatever driver.js does.
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly progress = inject(GuidanceProgressService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Everything driver.js leaves on `<body>` while a tour is running. */
  private static readonly BODY_CLASSES = [
    'driver-active',
    'driver-fade',
    'driver-simple',
    'driver-no-scroll',
  ];

  private active: Driver | null = null;

  private readonly runningKey = signal<string | null>(null);

  /** The tour currently on screen, or null. Drives the launcher's state. */
  readonly running = this.runningKey.asReadonly();

  constructor() {
    // NavigationStart, not NavigationEnd: tear the tour down before the
    // page it points at is unmounted, so driver.js is never asked to
    // track an element that has gone.
    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.stopForNavigation());
  }

  isRunning(tourKey?: string): boolean {
    const current = this.runningKey();
    return tourKey ? current === tourKey : current !== null;
  }

  /**
   * Starts a topic's tour. Starting a tour while another is running
   * replaces it — the previous one counts as dismissed, because the
   * user navigated away from it rather than finishing it.
   */
  start(topic: HelpTopic): void {
    if (topic.tour.length === 0) {
      return;
    }

    this.stop();

    const instance = driver({
      showProgress: topic.tour.length > 1,
      allowClose: true,
      overlayOpacity: 0.6,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: 'taskflow-tour',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      progressText: 'Step {{current}} of {{total}}',
      steps: topic.tour.map((step) => this.toDriveStep(step)),
      onDestroyStarted: () => {
        // driver.js hands this hook the responsibility for finishing the
        // teardown: it returns without removing anything and waits for
        // `destroy()`. So that call goes in a `finally` — if recording
        // the outcome ever threw, the overlay would stay up and the
        // page would be unclickable until a reload.
        try {
          // The only hook that can tell "finished" from "closed": once
          // driver has been destroyed the step pointer is gone.
          const finished = !instance.hasNextStep();

          if (finished) {
            this.progress.completeTour(topic.key);
          } else {
            this.progress.dismissTour(topic.key);
          }
        } finally {
          instance.destroy();
        }
      },
      onDestroyed: () => {
        this.active = null;
        this.runningKey.set(null);
        this.releaseOverlay();
      },
    });

    this.active = instance;
    this.runningKey.set(topic.key);

    instance.drive();
  }

  /**
   * Replays a tour from the beginning, forgetting the previous outcome
   * first so the launcher's "unseen" cue is honest while it runs.
   */
  restart(topic: HelpTopic): void {
    this.progress.resetTour(topic.key);
    this.start(topic);
  }

  /**
   * Closes any running tour.
   *
   * `destroy()` skips the `onDestroyStarted` hook by design, so this
   * records nothing — callers that need an outcome recorded do it
   * themselves. The overlay release afterwards is unconditional: it is
   * the only thing standing between a driver.js teardown that did not
   * finish and a page that silently refuses every click.
   */
  stop(): void {
    try {
      this.active?.destroy();
    } finally {
      this.active = null;
      this.runningKey.set(null);
      this.releaseOverlay();
    }
  }

  /**
   * Leaving the page counts as walking away from the tour, which is a
   * dismissal: it stops the launcher nudging about this page while
   * leaving the tour on offer for whenever the user wants it.
   */
  private stopForNavigation(): void {
    const key = this.runningKey();

    if (key === null) {
      // Nothing running, but a previous teardown may still have left
      // the page locked. Cheap to check, and the check is the whole
      // point of having a backstop.
      this.releaseOverlay();
      return;
    }

    this.progress.dismissTour(key);
    this.stop();
  }

  /**
   * Removes anything driver.js may have left at the document root.
   *
   * Every path through `destroy()` is supposed to do this itself, and
   * normally does. The cost of it not happening once is a page the user
   * can only recover by reloading, so this runs anyway — after every
   * stop, and on every navigation.
   */
  private releaseOverlay(): void {
    const body = document.body;

    TourService.BODY_CLASSES.forEach((className) => body.classList.remove(className));

    // The popover and the cut-out are portalled to the document root,
    // outside Angular's view, so an aborted teardown strands them there.
    document
      .querySelectorAll('.driver-popover, .driver-overlay, #driver-dummy-element')
      .forEach((node) => node.remove());
  }

  /**
   * A step with an anchor that is not currently in the DOM keeps its
   * copy but loses its element, so it reads as a centred card rather
   * than pointing at nothing.
   */
  private toDriveStep(step: TourStep): DriveStep {
    const anchored = step.element ? document.querySelector(step.element) : null;

    return {
      ...(anchored ? { element: step.element } : {}),
      popover: {
        title: step.title,
        description: step.description,
        ...(anchored && step.side ? { side: step.side } : {}),
        ...(anchored && step.align ? { align: step.align } : {}),
      },
    };
  }
}
