import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Plus, Trash2, X } from 'lucide-angular';
import { DialogDirective } from '@shared/directives/dialog.directive';
import { controlValidators, messageFor } from '@shared/validations';
import { MeetingFormModel } from '../organization.form-models';
import { MeetingDetail, MeetingPayload } from '../meetings.models';

@Component({
  selector: 'app-meeting-form-drawer', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, DialogDirective],
  templateUrl: './meeting-form-drawer.html', styleUrl: './meeting-form-drawer.scss',
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Plus, Trash2, X }) }],
})
export class MeetingFormDrawer {
  private readonly fb = inject(FormBuilder); private readonly rules = controlValidators(MeetingFormModel);
  readonly meeting = input<MeetingDetail | null>(null); readonly saving = input(false);
  readonly scheduleError = signal<string | null>(null);
  readonly dismiss = output<void>(); readonly save = output<MeetingPayload>();
  readonly form = this.fb.nonNullable.group({
    title: ['', this.rules['title']], description: ['', this.rules['description']], scheduled: [true],
    start: [''], end: [''], timeZone: [Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', this.rules['timeZone']],
    lobbyEnabled: [true], guestsAllowed: [false], participantsCanPublish: [true],
    participantsCanShareScreen: [true], participantsCanEditNote: [true], viewersCanChat: [false],
    retentionDays: [90], badges: this.fb.array<FormGroup<{ label: FormControl<string>; color: FormControl<string> }>>([]),
  });
  get badges() { return this.form.controls.badges; }
  constructor() { effect(() => { const meeting = this.meeting(); this.badges.clear();
    for (const badge of meeting?.badges ?? []) this.addBadge(badge.label, badge.color);
    const scheduled = meeting ? meeting.scheduledStartUtc != null : true;
    this.form.reset({ title: meeting?.title ?? '', description: meeting?.description ?? '', scheduled,
      start: this.wallTime(meeting?.scheduledStartUtc, meeting?.timeZone), end: this.wallTime(meeting?.scheduledEndUtc, meeting?.timeZone),
      timeZone: meeting?.timeZone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'),
      lobbyEnabled: meeting?.lobbyEnabled ?? true, guestsAllowed: meeting?.guestsAllowed ?? false,
      participantsCanPublish: meeting?.participantsCanPublish ?? true,
      participantsCanShareScreen: meeting?.participantsCanShareScreen ?? true,
      participantsCanEditNote: meeting?.participantsCanEditNote ?? true,
      viewersCanChat: meeting?.viewersCanChat ?? false, retentionDays: meeting?.retentionDays ?? 90,
      badges: this.badges.value }); this.scheduleError.set(null); }); }
  addBadge(label = '', color = 'blue'): void { this.badges.push(this.fb.nonNullable.group({ label, color })); }
  fieldError(property: string): string | null { return messageFor(this.form, property); }
  submit(): void { const value = this.form.getRawValue();
    this.scheduleError.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    let scheduledStartUtc: string | null = null; let scheduledEndUtc: string | null = null;
    if (value.scheduled) {
      if (!value.start || !value.end) { this.scheduleError.set('Enter both a start and end time.'); return; }
      try { scheduledStartUtc = this.utcFromWallTime(value.start, value.timeZone); scheduledEndUtc = this.utcFromWallTime(value.end, value.timeZone); }
      catch { this.scheduleError.set('Enter a valid local time in a recognized time zone. Times skipped by daylight saving do not exist.'); return; }
      if (scheduledEndUtc <= scheduledStartUtc) { this.scheduleError.set('The end time must be after the start time.'); return; }
    }
    this.save.emit({ title: value.title.trim(), description: value.description.trim() || null,
      scheduledStartUtc, scheduledEndUtc, timeZone: value.timeZone,
      lobbyEnabled: value.lobbyEnabled, guestsAllowed: value.guestsAllowed,
      participantsCanPublish: value.participantsCanPublish,
      participantsCanShareScreen: value.participantsCanShareScreen,
      participantsCanEditNote: value.participantsCanEditNote, viewersCanChat: value.viewersCanChat,
      retentionDays: Math.min(3650, Math.max(1, Number(value.retentionDays) || 90)),
      badges: this.meeting() ? undefined : value.badges.filter((badge) => badge.label.trim()).map((badge) => ({ label: badge.label.trim(), color: badge.color, icon: null })),
    }); }
  private wallTime(value: string | null | undefined, timeZone?: string): string { if (!value) return '';
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timeZone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
  }
  private utcFromWallTime(value: string, timeZone: string): string {
    const [datePart, timePart] = value.split('T'); const [year, month, day] = datePart.split('-').map(Number); const [hour, minute] = timePart.split(':').map(Number);
    const desired = Date.UTC(year, month - 1, day, hour, minute); let guess = desired;
    for (let index = 0; index < 3; index++) { const rendered = this.wallTime(new Date(guess).toISOString(), timeZone); const [renderedDate, renderedTime] = rendered.split('T'); const [ry, rm, rd] = renderedDate.split('-').map(Number); const [rh, rmin] = renderedTime.split(':').map(Number); guess += desired - Date.UTC(ry, rm - 1, rd, rh, rmin); }
    if (this.wallTime(new Date(guess).toISOString(), timeZone) !== value.slice(0, 16)) throw new Error('Nonexistent wall time');
    return new Date(guess).toISOString();
  }
}
