import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  Building2,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Moon,
  Settings,
  Sun,
  Users,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { ThemeService } from '@core/services/theme.service';
import { AuthFacade } from '@features/auth/auth.facade';

/** Shell for the platform Admin portal (Admin system role). */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Sun,
        Moon,
        LogOut,
        LayoutDashboard,
        LibraryBig,
        Users,
        Building2,
        Settings,
      }),
    },
  ],
})
export class AdminLayout {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly authFacade = inject(AuthFacade);
  private readonly settings = inject(APP_SETTINGS);

  readonly isDark = this.themeService.isDark;
  readonly user = this.authService.user;
  readonly plannerEnabled = this.settings.features.planner;

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authFacade.logout();
  }
}
