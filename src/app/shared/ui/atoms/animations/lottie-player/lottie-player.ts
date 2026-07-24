import { Component, computed, input } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

/**
 * Thin wrapper around `<ng-lottie>` so pages can drop in a Lottie animation with a consistent API.
 * Feed it a `src` path to a JSON under `public/lottie/` (served same-origin — no external fetch).
 *
 * Example: `<app-lottie-player src="/lottie/loading-dots.json" [width]="90" [height]="36" />`
 */
@Component({
  selector: 'app-lottie-player',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './lottie-player.html',
  styleUrl: './lottie-player.scss',
})
export class LottiePlayer {
  /** Path to the animation JSON (e.g. `/lottie/loading-dots.json`). */
  readonly src = input.required<string>();
  readonly width = input(120);
  readonly height = input(120);
  readonly loop = input(true);
  readonly ariaLabel = input('Animation');

  readonly options = computed<AnimationOptions>(() => ({
    path: this.src(),
    loop: this.loop(),
    autoplay: true,
  }));

  readonly styleObj = computed(() => ({
    width: `${this.width()}px`,
    height: `${this.height()}px`,
    margin: '0 auto',
  }));
}
