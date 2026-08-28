import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { plannerFeatureGuard } from './planner-feature.guard';

describe('plannerFeatureGuard', () => {
  it('allows the rollout route when Planner is enabled', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: APP_SETTINGS, useValue: { features: { planner: true } } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => plannerFeatureGuard('/member/dashboard')(
      {} as never,
      [] as never,
    ));

    expect(result).toBeTrue();
  });

  it('redirects safely when the rollout flag is disabled', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: APP_SETTINGS, useValue: { features: { planner: false } } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => plannerFeatureGuard('/member/dashboard')(
      {} as never,
      [] as never,
    ));

    expect(result).toEqual(TestBed.inject(Router).parseUrl('/member/dashboard'));
  });
});
