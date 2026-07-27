import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  BarChart3,
  Bell,
  CalendarDays,
  Check,
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
  Mail,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-angular';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { AuthFacade } from '@features/auth/auth.facade';
import { MemberFacade } from '@features/member/member.facade';
import { OrganizationFacade } from '@features/organization/organization.facade';
import { OrganizationListItem } from '@features/organization/organization.models';

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
        Check,
        Mail,
        SlidersHorizontal,
        X, // mobile sidebar toggle swaps Menu -> X while open
      }),
    },
  ],
})
export class OrganizationLayout {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly authFacade = inject(AuthFacade);
  private readonly orgFacade = inject(OrganizationFacade);
  /** Invitations are user-scoped, so an org account can have them too — see the sidebar badge. */
  private readonly memberFacade = inject(MemberFacade);

  readonly isDark = this.themeService.isDark;
  readonly user = this.authService.user;
  readonly pendingInvitations = this.memberFacade.pendingCount;

  readonly organizations = this.orgFacade.organizations;
  readonly currentOrg = this.orgFacade.currentOrg;

  readonly switcherOpen = signal(false);
  readonly hasMultipleOrgs = computed(() => this.organizations().length > 1);

  /**
   * Mobile sidebar. The sidebar is `d-lg-flex` (desktop-only) and the header's hamburger had no
   * handler at all, so below 992px the org portal had NO navigation whatsoever — Phase 6.
   */
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  constructor() {
    this.orgFacade.init();
    this.memberFacade.init();
  }

  toggleSwitcher(): void {
    if (this.hasMultipleOrgs()) {
      this.switcherOpen.update((v) => !v);
    }
  }

  selectOrg(org: OrganizationListItem): void {
    this.switcherOpen.set(false);
    if (org.id !== this.currentOrg()?.id) {
      this.orgFacade.selectOrganization(org);
    }
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authFacade.logout();
  }
}
