import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarClock, Check, KeyRound, LUCIDE_ICONS, LockKeyhole, LucideAngularModule, LucideIconProvider, Mail, ShieldCheck, Users, Video } from 'lucide-angular';
import { AuthService } from '@core/auth/auth.service';
import { MeetingAccessLevel, MeetingParticipantState, accessLevelLabel } from '@features/organization/meetings.models';
import { MeetingsGuestFacade } from '../meetings-guest.facade';

@Component({
  selector: 'app-guest-join-page', standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './guest-join-page.html', styleUrl: './guest-join-page.scss',
  providers: [MeetingsGuestFacade, { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ CalendarClock, Check, KeyRound, LockKeyhole, Mail, ShieldCheck, Users, Video }) }],
})
export class GuestJoinPage {
  readonly facade = inject(MeetingsGuestFacade); private readonly auth = inject(AuthService);
  readonly token = signal<string | null>(null); readonly email = signal(''); readonly displayName = signal(''); readonly code = signal(''); readonly bindAccount = signal(false);
  readonly user = this.auth.user; readonly Level = MeetingAccessLevel; readonly State = MeetingParticipantState;
  readonly canBind = computed(() => !!this.user() && this.user()!.email.toLowerCase() === this.email().trim().toLowerCase());
  constructor() {
    const token = this.facade.captureFragment(); this.token.set(token);
    this.facade.restore((restored) => { if (!restored && token) this.facade.inspect(token); else if (!restored && !token && !this.facade.error()) this.facade.error.set('Open the complete invitation link to continue.'); });
  }
  requestCode(): void { const token = this.token(); if (token && this.email().trim()) this.facade.requestCode(token, this.email().trim()); }
  verify(): void { const token = this.token(); if (token) this.facade.verify(token, this.email().trim(), this.code().trim(), this.displayName().trim(), this.bindAccount() && this.canBind()); }
  setCode(value: string): void { this.code.set(value.replace(/\D/g, '').slice(0, 6)); }
  accessLabel(level: MeetingAccessLevel): string { return accessLevelLabel(level); }
  formatDate(value: string | null): string { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) : 'Available when the host starts it'; }
  stateTitle(state: MeetingParticipantState): string { return state === MeetingParticipantState.Admitted ? 'You’re cleared to join' : 'You’re in the lobby'; }
  stateCopy(state: MeetingParticipantState): string { return state === MeetingParticipantState.Admitted ? 'The host admitted you. The audio and video room becomes available in Meeting Phase 4.' : 'Your email is verified. The host can now admit you without giving you access to the rest of TaskFlow.'; }
}
