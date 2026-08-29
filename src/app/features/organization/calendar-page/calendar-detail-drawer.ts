import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  X,
} from 'lucide-angular';

import { DialogDirective } from '@shared/directives/dialog.directive';
import { CalendarItem } from './calendar-page.model';
import { CalendarEntry } from '../organization.models';

@Component({
  selector: 'app-calendar-detail-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, DialogDirective],
  templateUrl: './calendar-detail-drawer.html',
  styleUrl: './calendar-detail-drawer.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ X }),
    },
  ],
})
export class CalendarDetailDrawer {
  readonly item = input.required<CalendarItem>();
  readonly canManageTasks = input(false);
  readonly canManageCalendar = input(false);
  readonly editCalendarEntry = output<CalendarEntry>();
  readonly dismiss = output<void>();
}
