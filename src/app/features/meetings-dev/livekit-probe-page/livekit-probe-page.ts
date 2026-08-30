import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { MeetingRoomService } from '@core/meetings/meeting-room.service';

interface ProbeTokenResponse {
  webSocketUrl: string;
  roomName: string;
  participantIdentity: string;
  token: string;
  expiresAtUtc: string;
}

@Component({
  selector: 'app-livekit-probe-page',
  imports: [FormsModule],
  templateUrl: './livekit-probe-page.html',
  styleUrl: './livekit-probe-page.scss',
})
export class LiveKitProbePage implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(APP_SETTINGS);
  readonly room = inject(MeetingRoomService);
  private readonly apiBaseUrl =
    new URLSearchParams(globalThis.location?.search ?? '').get('api') ?? this.settings.api.baseUrl;

  @ViewChild('media', { static: true }) private media!: ElementRef<HTMLElement>;

  readonly displayName = signal(`Probe ${crypto.randomUUID().slice(0, 6)}`);
  readonly roomName = signal<string | null>(null);
  readonly participantIdentity = signal<string | null>(null);
  readonly busy = signal(false);
  readonly actionError = signal<string | null>(null);

  async join(): Promise<void> {
    if (!this.room.isSupported()) {
      this.actionError.set('This browser does not expose the WebRTC APIs required by LiveKit.');
      return;
    }

    this.busy.set(true);
    this.actionError.set(null);
    try {
      const response = await firstValueFrom(
        this.http.post<ProbeTokenResponse>(
          `${this.apiBaseUrl}/dev/meetings/livekit/token`,
          { displayName: this.displayName() },
        ),
      );
      this.roomName.set(response.roomName);
      this.participantIdentity.set(response.participantIdentity);
      await this.room.connect(response.webSocketUrl, response.token, this.media.nativeElement);
    } catch (error) {
      this.actionError.set(error instanceof Error ? error.message : 'Could not join the probe room.');
    } finally {
      this.busy.set(false);
    }
  }

  async toggleMicrophone(): Promise<void> {
    await this.runMediaAction(() =>
      this.room.setMicrophoneEnabled(!this.room.microphoneEnabled()),
    );
  }

  async toggleCamera(): Promise<void> {
    await this.runMediaAction(() => this.room.setCameraEnabled(!this.room.cameraEnabled()));
  }

  async toggleScreenShare(): Promise<void> {
    await this.runMediaAction(() =>
      this.room.setScreenShareEnabled(!this.room.screenShareEnabled()),
    );
  }

  async leave(): Promise<void> {
    await this.room.disconnect();
  }

  ngOnDestroy(): void {
    void this.room.disconnect();
  }

  private async runMediaAction(action: () => Promise<void>): Promise<void> {
    this.actionError.set(null);
    try {
      await action();
    } catch (error) {
      this.actionError.set(error instanceof Error ? error.message : 'Media action failed.');
    }
  }
}
