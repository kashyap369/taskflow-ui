import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  Building2,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  LogOut,
  Mail,
  Moon,
  PenTool,
  Sun,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { AuthFacade } from '@features/auth/auth.facade';
import { MemberFacade } from '@features/member/member.facade';

/** Shell for the Member (Individual / solo user) portal. */
@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './member-layout.html',
  styleUrl: './member-layout.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Sun,
        Moon,
        LogOut,
        LayoutDashboard,
        Mail,
        ListChecks,
        Building2,
        FolderKanban,
        PenTool,
      }),
    },
  ],
})
export class MemberLayout {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly authFacade = inject(AuthFacade);
  private readonly memberFacade = inject(MemberFacade);

  readonly isDark = this.themeService.isDark;
  readonly user = this.authService.user;
  /** Badge on the Invitations nav item — invitations this user can still act on. */
  readonly pendingInvitations = this.memberFacade.pendingCount;
  /** Organization workspace switch appears once this Individual owns or joins one. */
  readonly hasOrganizations = this.memberFacade.hasOrganizations;

  constructor() {
    // Loaded here (not just on the page) so the badge is right wherever the user lands.
    this.memberFacade.init();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authFacade.logout();
  }
}
