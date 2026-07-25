import { Component, computed, inject, input } from '@angular/core';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

import { ThemeService } from '@core/services/theme.service';

/**
 * Theme-aware skeleton placeholder — a thin wrapper over `ngx-skeleton-loader` that paints the base
 * in our `--surface-inset` token and picks the light/dark shimmer from the active theme, so loading
 * states match the design system in both modes. Compose these to shape content-aware skeletons
 * (rows, cards, tables) on list pages while data loads.
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgxSkeletonLoaderComponent],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
})
export class Skeleton {
  private readonly theme = inject(ThemeService);

  /** Circles for avatars; lines for text/blocks (use `radius` to square the corners). */
  readonly circle = input(false);
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly radius = input('8px');
  /** Number of stacked repetitions. */
  readonly count = input(1);

  readonly appearance = computed<'line' | 'circle'>(() => (this.circle() ? 'circle' : 'line'));

  /** Dark shimmer on dark surfaces, light shimmer on light. */
  readonly animation = computed<'progress' | 'progress-dark'>(() =>
    this.theme.isDark() ? 'progress-dark' : 'progress',
  );

  /** Inline theme handed to ngx-skeleton-loader — token background + caller-controlled geometry. */
  readonly skeletonTheme = computed(() => ({
    'background-color': 'var(--surface-inset)',
    width: this.width(),
    height: this.height(),
    'border-radius': this.circle() ? '50%' : this.radius(),
    margin: '0',
  }));
}
