import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-angular';

@Component({
  selector: 'app-organization-layout',
  imports: [LucideAngularModule, RouterOutlet],
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
      }),
    },
  ],
})
export class OrganizationLayout {}
