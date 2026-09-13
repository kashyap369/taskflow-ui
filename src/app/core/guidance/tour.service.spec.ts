import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { HelpTopic } from './guidance.models';
import { GuidanceProgressService } from './guidance-progress.service';
import { TourService } from './tour.service';

/**
 * These cover the lock-out, not the tour.
 *
 * driver.js marks `<body>` with `driver-active` while a tour is on
 * screen, and its stylesheet turns that into
 * `.driver-active * { pointer-events: none }` — the page stops taking
 * clicks except on the highlighted element and the popover. Leaving that
 * class behind is therefore not a cosmetic bug: the whole application
 * ignores every click and scroll until the user reloads, with nothing on
 * screen to explain why. A route change used to do exactly that, because
 * nothing stopped a running tour and its popover was unmounted with the
 * page it pointed at.
 */
describe('TourService overlay lifecycle', () => {
  const topic: HelpTopic = {
    key: 'test.page',
    route: '/test',
    label: 'Test',
    icon: 'LayoutDashboard',
    summary: 'A page under test.',
    docSlug: 'test',
    related: [],
    portal: 'both',
    tour: [
      { title: 'One', description: 'First step.' },
      { title: 'Two', description: 'Second step.' },
    ],
  };

  let tours: TourService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        // Any URL resolves: these specs care that navigation happened, not where to.
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    tours = TestBed.inject(TourService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    tours.stop();
    localStorage.clear();
  });

  function bodyIsLocked(): boolean {
    return document.body.classList.contains('driver-active');
  }

  it('locks the page while a tour is running, which is what the overlay is for', () => {
    tours.start(topic);

    expect(tours.isRunning('test.page')).toBeTrue();
    expect(bodyIsLocked()).toBeTrue();
  });

  it('unlocks the page when the tour is stopped', () => {
    tours.start(topic);
    tours.stop();

    expect(tours.isRunning()).toBeFalse();
    expect(bodyIsLocked()).toBeFalse();
    expect(document.querySelector('.driver-popover')).toBeNull();
  });

  it('ends the tour on navigation instead of leaving the page unclickable', async () => {
    tours.start(topic);
    expect(bodyIsLocked()).toBeTrue();

    await router.navigateByUrl('/somewhere-else');

    expect(tours.isRunning()).toBeFalse();
    expect(bodyIsLocked()).toBeFalse();
    expect(document.querySelector('.driver-popover')).toBeNull();
  });

  it('records walking away from a tour as a dismissal, so it stops nudging', async () => {
    const progress = TestBed.inject(GuidanceProgressService);

    tours.start(topic);
    await router.navigateByUrl('/somewhere-else');

    expect(progress.isDismissed('test.page')).toBeTrue();
    expect(progress.isCompleted('test.page')).toBeFalse();
  });

  it('clears a lock left behind by something else, because only a reload otherwise would', async () => {
    // Simulates a teardown that did not finish — the state the user hit.
    document.body.classList.add('driver-active', 'driver-no-scroll');

    await router.navigateByUrl('/elsewhere');

    expect(bodyIsLocked()).toBeFalse();
    expect(document.body.classList.contains('driver-no-scroll')).toBeFalse();
  });
});
