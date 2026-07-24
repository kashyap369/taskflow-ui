import { Component } from '@angular/core';
import {
  ArrowRight,
  CheckCheck,
  CircleCheckBig,
  FolderKanban,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Plus,
  Sparkles,
  TriangleAlert,
} from 'lucide-angular';

import { ProjectHealthChart } from '@shared/ui/organisms/project-health-chart/project-health-chart';
import { ProductivityChart } from '@shared/ui/organisms/productivity-chart/productivity-chart';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [LucideAngularModule, ProjectHealthChart, ProductivityChart],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Sparkles,
        Plus,
        ArrowRight,
        FolderKanban,
        CheckCheck,
        CircleCheckBig,
        TriangleAlert,
      }),
    },
  ],
})
export class DashboardPage {}
