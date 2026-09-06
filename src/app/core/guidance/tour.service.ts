import { Injectable, inject, signal } from '@angular/core';
import { Driver, DriveStep, driver } from 'driver.js';

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
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly progress = inject(GuidanceProgressService);

  private active: Driver | null = null;

  private readonly runningKey = signal<string | null>(null);

  /** The tour currently on screen, or null. Drives the launcher's state. */
  readonly running = this.runningKey.asReadonly();

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
        // The only hook that can tell "finished" from "closed": once
        // driver has been destroyed the step pointer is gone.
        const finished = !instance.hasNextStep();

        if (finished) {
          this.progress.completeTour(topic.key);
        } else {
          this.progress.dismissTour(topic.key);
        }

        instance.destroy();
      },
      onDestroyed: () => {
        this.active = null;
        this.runningKey.set(null);
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

  /** Closes any running tour. Recorded as a dismissal, like any early exit. */
  stop(): void {
    this.active?.destroy();
    this.active = null;
    this.runningKey.set(null);
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
