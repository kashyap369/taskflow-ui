import { Component, inject } from '@angular/core';
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

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
