import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  ChevronLeft, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Mic, MicOff,
  MessageSquareText, MonitorUp, PhoneOff, Settings, Signal, Square, UserMinus, Users, Video, VideoOff,
  Volume2, VolumeX, WifiOff, X,
} from 'lucide-angular';
import { MeetingRoomParticipantView, MeetingRoomService } from '@core/meetings/meeting-room.service';
import { MeetingAccessLevel, MeetingRoomToken, accessLevelLabel } from '../meetings.models';
import { MeetingsRepository } from '../meetings.repository';
import { MeetingCollaborationPanel } from '@shared/ui/organisms/meeting-collaboration-panel/meeting-collaboration-panel';

@Component({
  selector: 'app-meeting-room-page', standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, MeetingCollaborationPanel],
  templateUrl: './meeting-room-page.html', styleUrl: './meeting-room-page.scss',
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({
    ChevronLeft, MessageSquareText, Mic, MicOff, MonitorUp, PhoneOff, Settings, Signal, Square, UserMinus,
    Users, Video, VideoOff, Volume2, VolumeX, WifiOff, X,
  }) }],
})
export class MeetingRoomPage implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  private readonly repository = inject(MeetingsRepository);
  readonly room = inject(MeetingRoomService); readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly Level = MeetingAccessLevel;
  @ViewChild('media') media?: ElementRef<HTMLElement>; @ViewChild('preview') preview?: ElementRef<HTMLVideoElement>;
  readonly token = signal<MeetingRoomToken | null>(null); readonly stage = signal<'loading' | 'prejoin' | 'joining' | 'room'>('loading');
  readonly error = signal<string | null>(null); readonly microphoneOn = signal(false); readonly cameraOn = signal(true);
  readonly audioInputId = signal(''); readonly videoInputId = signal(''); readonly audioOutputId = signal('');
  readonly rosterOpen = signal(true); readonly settingsOpen = signal(false); readonly moderationBusy = signal<string | null>(null);
  readonly collaborationOpen = signal(false);

  ngAfterViewInit(): void { this.requestToken(); }
  ngOnDestroy(): void { void this.room.disconnect(); }

  requestToken(): void {
    this.stage.set('loading'); this.error.set(null);
    this.repository.joinToken(this.id).subscribe({
      next: (token) => { this.token.set(token); this.microphoneOn.set(token.canPublish); this.cameraOn.set(token.canPublish); this.stage.set('prejoin'); setTimeout(() => void this.prepareDevices()); },
      error: () => { this.error.set('The room is unavailable. Confirm the meeting is live and that you are assigned.'); this.stage.set('prejoin'); },
    });
  }

  async prepareDevices(): Promise<void> {
    if (!this.token()?.canPublish) return;
    await this.room.loadDevices(true); this.applyDeviceDefaults();
    if (this.cameraOn() && this.preview) await this.room.preparePreview(this.preview.nativeElement, this.videoInputId());
  }

  async togglePreviewCamera(): Promise<void> {
    this.cameraOn.update((value) => !value);
    if (this.cameraOn() && this.preview) await this.room.preparePreview(this.preview.nativeElement, this.videoInputId());
    else await this.room.stopPreview();
  }
  togglePreviewMicrophone(): void { this.microphoneOn.set(!this.microphoneOn()); }

  async changePreviewCamera(value: string): Promise<void> {
    this.videoInputId.set(value); if (this.cameraOn() && this.preview) await this.room.preparePreview(this.preview.nativeElement, value);
  }

  async join(): Promise<void> {
    const token = this.token(); if (!token) return;
    this.stage.set('joining'); this.error.set(null);
    await new Promise<void>((resolve) => setTimeout(resolve));
    if (!this.media) { this.stage.set('prejoin'); this.error.set('The meeting room could not be prepared. Try again.'); return; }
    try {
      await this.room.connect(token.webSocketUrl, token.token, this.media.nativeElement, {
        microphoneEnabled: token.canPublish && this.microphoneOn(), cameraEnabled: token.canPublish && this.cameraOn(),
        audioInputId: this.audioInputId(), videoInputId: this.videoInputId(), audioOutputId: this.audioOutputId(),
      });
      this.stage.set('room');
    } catch { this.error.set(this.room.lastError() ?? 'The call could not connect. Check your network and try again.'); this.stage.set('prejoin'); }
  }

  async toggleMic(): Promise<void> { await this.safely(() => this.room.setMicrophoneEnabled(!this.room.microphoneEnabled())); }
  async toggleCamera(): Promise<void> { await this.safely(() => this.room.setCameraEnabled(!this.room.cameraEnabled())); }
  async toggleShare(): Promise<void> { if (this.token()?.canShareScreen) await this.safely(() => this.room.setScreenShareEnabled(!this.room.screenShareEnabled())); }
  async switchDevice(kind: MediaDeviceKind, value: string): Promise<void> {
    if (kind === 'audioinput') this.audioInputId.set(value); else if (kind === 'videoinput') this.videoInputId.set(value); else this.audioOutputId.set(value);
    await this.safely(() => this.room.switchDevice(kind, value));
  }
  async leave(): Promise<void> { await this.room.disconnect(); await this.router.navigate(['/organization/meetings', this.id]); }
  endMeeting(): void {
    this.repository.end(this.id).subscribe({ next: () => void this.leave(), error: () => this.error.set('The meeting could not be ended. Try again.') });
  }
  remove(participant: MeetingRoomParticipantView): void {
    if (participant.participantId == null) return; this.moderationBusy.set(participant.identity);
    this.repository.removeRoomParticipant(this.id, participant.participantId).subscribe({
      next: () => this.moderationBusy.set(null), error: () => { this.moderationBusy.set(null); this.room.actionError.set('This participant could not be removed.'); },
    });
  }
  mute(participant: MeetingRoomParticipantView): void {
    if (participant.participantId == null || !participant.audioTrackSid) return; this.moderationBusy.set(participant.identity);
    this.repository.muteRoomParticipant(this.id, participant.participantId, { participantIdentity: participant.identity, trackSid: participant.audioTrackSid, muted: true }).subscribe({
      next: () => this.moderationBusy.set(null), error: () => { this.moderationBusy.set(null); this.room.actionError.set('This microphone could not be muted.'); },
    });
  }
  accessLabel(level: number | null): string { return level == null ? 'Participant' : accessLevelLabel(level as MeetingAccessLevel); }
  canModerate(participant: MeetingRoomParticipantView): boolean {
    if (!this.token()?.canModerate || participant.isLocal || participant.participantId == null) return false;
    if (participant.accessLevel === MeetingAccessLevel.Host) return false;
    return this.token()?.accessLevel === MeetingAccessLevel.Host || participant.accessLevel !== MeetingAccessLevel.CoHost;
  }
  trackParticipant(_: number, participant: MeetingRoomParticipantView): string { return participant.identity; }

  private applyDeviceDefaults(): void {
    this.audioInputId.set(this.audioInputId() || this.room.audioInputDevices()[0]?.deviceId || '');
    this.videoInputId.set(this.videoInputId() || this.room.videoInputDevices()[0]?.deviceId || '');
    this.audioOutputId.set(this.audioOutputId() || this.room.audioOutputDevices()[0]?.deviceId || '');
  }
  private async safely(action: () => Promise<void>): Promise<void> { try { await action(); } catch { /* service exposes the recovery message */ } }
}
