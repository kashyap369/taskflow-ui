import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  LogOut,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { AuthFacade } from '@features/auth/auth.facade';

/** Shell for the Member (Individual / solo user) portal. */
@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './member-layout.html',
  styleUrl: './member-layout.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Sparkles, Sun, Moon, LogOut }),
    },
  ],
})
export class MemberLayout {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly authFacade = inject(AuthFacade);

  readonly isDark = this.themeService.isDark;
  readonly user = this.authService.user;

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authFacade.logout();
  }
}
