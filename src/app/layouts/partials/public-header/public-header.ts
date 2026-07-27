import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-angular';

import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './public-header.html',
  styleUrl: './public-header.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Sparkles, ArrowRight, Sun, Moon }),
    },
  ],
})
export class PublicHeader {
  private readonly themeService = inject(ThemeService);

  readonly isDark = this.themeService.isDark;

  readonly navLinks = [
    { label: 'Features', fragment: 'features' },
    { label: 'Workflow', fragment: 'workflow' },
    { label: 'Pricing', fragment: 'pricing' },
    { label: 'Customers', fragment: 'customers' },
  ];

  /**
   * Mobile nav. This used to be driven by Bootstrap's `data-bs-toggle="collapse"`, but the project
   * loads no Bootstrap JS (`angular.json` → `scripts: []`), so the public site's mobile menu never
   * opened at all. Now a signal — Phase 6.
   */
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
