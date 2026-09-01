import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ChevronLeft, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, MessageSquareText, Mic, MicOff,
  MonitorUp, PhoneOff, Settings, Signal, UserMinus, Users, Video, VideoOff, Volume2,
  VolumeX, WifiOff, X,
} from 'lucide-angular';
import { MeetingRoomParticipantView, MeetingRoomService } from '@core/meetings/meeting-room.service';
import { MeetingAccessLevel, MeetingRoomToken, accessLevelLabel } from '@features/organization/meetings.models';
import { MeetingsGuestRepository } from '../meetings-guest.repository';
import { MeetingCollaborationPanel } from '@shared/ui/organisms/meeting-collaboration-panel/meeting-collaboration-panel';

@Component({ selector: 'app-guest-room-page', standalone: true, imports: [CommonModule, RouterLink, LucideAngularModule, MeetingCollaborationPanel],
  templateUrl: './guest-room-page.html', styleUrl: './guest-room-page.scss', providers: [{ provide: LUCIDE_ICONS,
    multi: true, useValue: new LucideIconProvider({ ChevronLeft, MessageSquareText, Mic, MicOff, MonitorUp, PhoneOff,
      Settings, Signal, UserMinus, Users, Video, VideoOff, Volume2, VolumeX, WifiOff, X }) }] })
export class GuestRoomPage implements AfterViewInit, OnDestroy {
  private readonly repository = inject(MeetingsGuestRepository); private readonly router = inject(Router);
  readonly room = inject(MeetingRoomService); readonly Level = MeetingAccessLevel;
  @ViewChild('media') media?: ElementRef<HTMLElement>; @ViewChild('preview') preview?: ElementRef<HTMLVideoElement>;
  readonly token = signal<MeetingRoomToken | null>(null); readonly stage = signal<'loading' | 'prejoin' | 'joining' | 'room'>('loading');
  readonly error = signal<string | null>(null); readonly microphoneOn = signal(false); readonly cameraOn = signal(true);
  readonly audioInputId = signal(''); readonly videoInputId = signal(''); readonly audioOutputId = signal('');
  readonly rosterOpen = signal(true); readonly settingsOpen = signal(false); readonly moderationBusy = signal<string | null>(null);
  readonly collaborationOpen = signal(false);
  sessionToken(): string { return sessionStorage.getItem('taskflow.meeting.guest-session') ?? ''; }

  ngAfterViewInit(): void { this.requestToken(); } ngOnDestroy(): void { void this.room.disconnect(); }
  requestToken(): void {
    const session = this.sessionToken();
    if (!session) { this.error.set('Your guest session expired. Reopen the invitation and verify again.'); this.stage.set('prejoin'); return; }
    this.stage.set('loading'); this.error.set(null);
    this.repository.joinToken(session).subscribe({ next: (token) => { this.token.set(token); this.microphoneOn.set(token.canPublish); this.cameraOn.set(token.canPublish); this.stage.set('prejoin'); setTimeout(() => void this.prepareDevices()); }, error: () => { this.error.set('The host has not admitted you, the meeting ended, or your access was removed.'); this.stage.set('prejoin'); } });
  }
  async prepareDevices(): Promise<void> { if (!this.token()?.canPublish) return; await this.room.loadDevices(true); this.applyDeviceDefaults(); if (this.cameraOn() && this.preview) await this.room.preparePreview(this.preview.nativeElement, this.videoInputId()); }
  togglePreviewMicrophone(): void { this.microphoneOn.set(!this.microphoneOn()); }
  async togglePreviewCamera(): Promise<void> { this.cameraOn.set(!this.cameraOn()); if (this.cameraOn() && this.preview) await this.room.preparePreview(this.preview.nativeElement, this.videoInputId()); else await this.room.stopPreview(); }
  async changePreviewCamera(value: string): Promise<void> { this.videoInputId.set(value); if (this.cameraOn() && this.preview) await this.room.preparePreview(this.preview.nativeElement, value); }
  async join(): Promise<void> {
    const token = this.token(); if (!token) return; this.stage.set('joining'); this.error.set(null);
    await new Promise<void>((resolve) => setTimeout(resolve));
    if (!this.media) { this.stage.set('prejoin'); this.error.set('The meeting room could not be prepared. Try again.'); return; }
    try { await this.room.connect(token.webSocketUrl, token.token, this.media.nativeElement, { microphoneEnabled: token.canPublish && this.microphoneOn(), cameraEnabled: token.canPublish && this.cameraOn(), audioInputId: this.audioInputId(), videoInputId: this.videoInputId(), audioOutputId: this.audioOutputId() }); this.stage.set('room'); }
    catch { this.error.set(this.room.lastError() ?? 'The call could not connect. Check your network and try again.'); this.stage.set('prejoin'); }
  }
  async toggleMic(): Promise<void> { await this.safely(() => this.room.setMicrophoneEnabled(!this.room.microphoneEnabled())); }
  async toggleCamera(): Promise<void> { await this.safely(() => this.room.setCameraEnabled(!this.room.cameraEnabled())); }
  async toggleShare(): Promise<void> { if (this.token()?.canShareScreen) await this.safely(() => this.room.setScreenShareEnabled(!this.room.screenShareEnabled())); }
  async switchDevice(kind: MediaDeviceKind, value: string): Promise<void> { if (kind === 'audioinput') this.audioInputId.set(value); else if (kind === 'videoinput') this.videoInputId.set(value); else this.audioOutputId.set(value); await this.safely(() => this.room.switchDevice(kind, value)); }
  async leave(): Promise<void> { await this.room.disconnect(); await this.router.navigate(['/meetings/join']); }
  remove(participant: MeetingRoomParticipantView): void { const session = this.sessionToken(); if (!session || participant.participantId == null) return; this.moderationBusy.set(participant.identity); this.repository.removeRoomParticipant(session, participant.participantId).subscribe({ next: () => this.moderationBusy.set(null), error: () => { this.moderationBusy.set(null); this.room.actionError.set('This participant could not be removed.'); } }); }
  mute(participant: MeetingRoomParticipantView): void { const session = this.sessionToken(); if (!session || participant.participantId == null || !participant.audioTrackSid) return; this.moderationBusy.set(participant.identity); this.repository.muteRoomParticipant(session, participant.participantId, { participantIdentity: participant.identity, trackSid: participant.audioTrackSid, muted: true }).subscribe({ next: () => this.moderationBusy.set(null), error: () => { this.moderationBusy.set(null); this.room.actionError.set('This microphone could not be muted.'); } }); }
  accessLabel(level: number | null): string { return level == null ? 'Participant' : accessLevelLabel(level as MeetingAccessLevel); }
  canModerate(participant: MeetingRoomParticipantView): boolean { if (!this.token()?.canModerate || participant.isLocal || participant.participantId == null || participant.accessLevel === MeetingAccessLevel.Host) return false; return this.token()?.accessLevel === MeetingAccessLevel.Host || participant.accessLevel !== MeetingAccessLevel.CoHost; }
  private applyDeviceDefaults(): void { this.audioInputId.set(this.room.audioInputDevices()[0]?.deviceId || ''); this.videoInputId.set(this.room.videoInputDevices()[0]?.deviceId || ''); this.audioOutputId.set(this.room.audioOutputDevices()[0]?.deviceId || ''); }
  private async safely(action: () => Promise<void>): Promise<void> { try { await action(); } catch { /* service exposes recovery */ } }
}
