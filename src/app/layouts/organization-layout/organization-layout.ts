import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  CircleHelp,
  Crown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { AuthFacade } from '@features/auth/auth.facade';

@Component({
  selector: 'app-organization-layout',
  imports: [LucideAngularModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './organization-layout.html',
  styleUrl: './organization-layout.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Menu,
        Search,
        Plus,
        Bell,
        Settings,
        Sparkles,
        ChevronDown,
        LayoutDashboard,
        FolderKanban,
        CheckSquare,
        CalendarDays,
        Users,
        BarChart3,
        CircleHelp,
        Crown,
        LogOut,
        Sun,
        Moon,
      }),
    },
  ],
})
export class OrganizationLayout {
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
