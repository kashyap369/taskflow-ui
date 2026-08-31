import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from 'lucide-angular';
import { MeetingRoomService } from '@core/meetings/meeting-room.service';
import { MeetingsRepository } from '../meetings.repository';
import { MeetingRoomToken } from '../meetings.models';

@Component({
  selector: 'app-meeting-room-page', standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './meeting-room-page.html', styleUrl: './meeting-room-page.scss',
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff }) }],
})
export class MeetingRoomPage implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute); private readonly repository = inject(MeetingsRepository);
  readonly room = inject(MeetingRoomService); readonly id = Number(this.route.snapshot.paramMap.get('id'));
  @ViewChild('media', { static: true }) media!: ElementRef<HTMLElement>;
  readonly token = signal<MeetingRoomToken | null>(null); readonly joining = signal(false); readonly error = signal<string | null>(null);
  ngAfterViewInit(): void { this.requestToken(); }
  ngOnDestroy(): void { void this.room.disconnect(); }
  requestToken(): void {
    this.joining.set(true); this.error.set(null);
    this.repository.joinToken(this.id).subscribe({ next: (token) => { this.token.set(token); this.connect(token); }, error: () => { this.joining.set(false); this.error.set('The meeting room could not be opened. Confirm that it is live and that you still have access.'); } });
  }
  async connect(token: MeetingRoomToken): Promise<void> { try { await this.room.connect(token.webSocketUrl, token.token, this.media.nativeElement); this.joining.set(false); } catch { this.joining.set(false); this.error.set(this.room.lastError() ?? 'LiveKit could not connect. Check your network and try again.'); } }
  async toggleMic(): Promise<void> { await this.room.setMicrophoneEnabled(!this.room.microphoneEnabled()); }
  async toggleCamera(): Promise<void> { await this.room.setCameraEnabled(!this.room.cameraEnabled()); }
  async toggleShare(): Promise<void> { if (this.token()?.canShareScreen) await this.room.setScreenShareEnabled(!this.room.screenShareEnabled()); }
  leave(): void { void this.room.disconnect(); }
}
