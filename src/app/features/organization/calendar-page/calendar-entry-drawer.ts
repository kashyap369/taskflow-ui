import { CommonModule } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Trash2, X } from 'lucide-angular';
import { DialogDirective } from '@shared/directives/dialog.directive';
import {
  CalendarEntry, CalendarEntryKind, CalendarEntryPayload, CalendarRecurrenceFrequency,
  OrganizationMember,
} from '../organization.models';

@Component({
  selector: 'app-calendar-entry-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DialogDirective],
  templateUrl: './calendar-entry-drawer.html',
  styleUrl: './calendar-entry-drawer.scss',
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Trash2, X }) }],
})
export class CalendarEntryDrawer {
  readonly entry = input<CalendarEntry | null>(null);
  readonly members = input.required<OrganizationMember[]>();
  readonly saving = input(false);
  readonly dismiss = output<void>();
  readonly save = output<CalendarEntryPayload>();
  readonly remove = output<number>();
  readonly confirmingDelete = signal(false);

  readonly Kind = CalendarEntryKind;
  readonly Frequency = CalendarRecurrenceFrequency;
  kind = CalendarEntryKind.OrganizationEvent;
  title = ''; description = ''; start = ''; end = ''; allDay = true;
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  memberUserId: number | null = null;
  recurrenceFrequency = CalendarRecurrenceFrequency.None;
  recurrenceInterval = 1; recurrenceUntil = '';

  constructor() {
    effect(() => {
      const entry = this.entry();
      this.kind = entry?.kind ?? CalendarEntryKind.OrganizationEvent;
      this.title = entry?.title ?? '';
      this.description = entry?.description ?? '';
      this.allDay = entry?.isAllDay ?? true;
      this.start = entry ? this.inputValue(entry.startsAtUtc, entry.isAllDay) : this.today();
      this.end = entry ? this.inputValue(entry.endsAtUtc, entry.isAllDay, entry.isAllDay) : this.today();
      this.timeZone = entry?.timeZone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      this.memberUserId = entry?.memberUserId ?? null;
      this.recurrenceFrequency = entry?.recurrenceFrequency ?? CalendarRecurrenceFrequency.None;
      this.recurrenceInterval = entry?.recurrenceInterval ?? 1;
      this.recurrenceUntil = entry?.recurrenceUntil ?? '';
      this.confirmingDelete.set(false);
    });
  }

  kindChanged(): void {
    if (this.kind !== CalendarEntryKind.OrganizationEvent) this.allDay = true;
    if (this.kind !== CalendarEntryKind.MemberLeave) this.memberUserId = null;
  }

  submit(): void {
    if (!this.title.trim() || !this.start || !this.end) return;
    const startsAtUtc = this.allDay ? `${this.start}T00:00:00Z` : new Date(this.start).toISOString();
    const endsAtUtc = this.allDay ? `${this.addDay(this.end)}T00:00:00Z` : new Date(this.end).toISOString();
    this.save.emit({
      id: this.entry()?.id,
      kind: this.kind,
      title: this.title.trim(),
      description: this.description.trim() || null,
      startsAtUtc, endsAtUtc, isAllDay: this.allDay, timeZone: this.timeZone,
      memberUserId: this.kind === CalendarEntryKind.MemberLeave ? this.memberUserId : null,
      recurrenceFrequency: this.recurrenceFrequency,
      recurrenceInterval: this.recurrenceFrequency === CalendarRecurrenceFrequency.None ? 1 : this.recurrenceInterval,
      recurrenceUntil: this.recurrenceFrequency === CalendarRecurrenceFrequency.None || !this.recurrenceUntil
        ? null : this.recurrenceUntil,
    });
  }

  private today(): string { return new Date().toISOString().slice(0, 10); }
  private addDay(value: string): string {
    const date = new Date(`${value}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
  }
  private inputValue(value: string, allDay: boolean, exclusiveEnd = false): string {
    if (allDay) {
      const date = new Date(value); if (exclusiveEnd) date.setUTCDate(date.getUTCDate() - 1);
      return date.toISOString().slice(0, 10);
    }
    const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }
}
