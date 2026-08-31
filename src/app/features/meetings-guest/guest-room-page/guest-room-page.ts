import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from 'lucide-angular';
import { MeetingRoomService } from '@core/meetings/meeting-room.service';
import { MeetingRoomToken } from '@features/organization/meetings.models';
import { MeetingsGuestRepository } from '../meetings-guest.repository';

@Component({ selector: 'app-guest-room-page', standalone: true, imports: [CommonModule, RouterLink, LucideAngularModule], templateUrl: './guest-room-page.html', styleUrl: './guest-room-page.scss', providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff }) }] })
export class GuestRoomPage implements AfterViewInit, OnDestroy {
  private readonly repository = inject(MeetingsGuestRepository); readonly room = inject(MeetingRoomService);
  @ViewChild('media', { static: true }) media!: ElementRef<HTMLElement>;
  readonly token = signal<MeetingRoomToken | null>(null); readonly joining = signal(false); readonly error = signal<string | null>(null);
  ngAfterViewInit(): void { this.requestToken(); } ngOnDestroy(): void { void this.room.disconnect(); }
  requestToken(): void { const session = sessionStorage.getItem('taskflow.meeting.guest-session'); if (!session) { this.error.set('Your guest session has expired. Reopen the invitation to verify again.'); return; } this.joining.set(true); this.error.set(null); this.repository.joinToken(session).subscribe({ next: (token) => { this.token.set(token); void this.connect(token); }, error: () => { this.joining.set(false); this.error.set('The host has not admitted you yet, the room has ended, or your access was removed.'); } }); }
  private async connect(token: MeetingRoomToken): Promise<void> { try { await this.room.connect(token.webSocketUrl, token.token, this.media.nativeElement); this.joining.set(false); } catch { this.joining.set(false); this.error.set(this.room.lastError() ?? 'LiveKit could not connect. Check your network and try again.'); } }
  async toggleMic(): Promise<void> { await this.room.setMicrophoneEnabled(!this.room.microphoneEnabled()); } async toggleCamera(): Promise<void> { await this.room.setCameraEnabled(!this.room.cameraEnabled()); } async toggleShare(): Promise<void> { if (this.token()?.canShareScreen) await this.room.setScreenShareEnabled(!this.room.screenShareEnabled()); } leave(): void { void this.room.disconnect(); }
}
