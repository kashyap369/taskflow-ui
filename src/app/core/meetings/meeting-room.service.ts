import { Injectable, signal } from '@angular/core';
import {
  ConnectionState,
  isBrowserSupported,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';

export type MeetingRoomConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

@Injectable({ providedIn: 'root' })
export class MeetingRoomService {
  private room: Room | null = null;
  private mediaContainer: HTMLElement | null = null;

  readonly connectionState = signal<MeetingRoomConnectionState>('disconnected');
  readonly participantCount = signal(0);
  readonly microphoneEnabled = signal(false);
  readonly cameraEnabled = signal(false);
  readonly screenShareEnabled = signal(false);
  readonly lastError = signal<string | null>(null);

  isSupported(): boolean {
    return isBrowserSupported();
  }

  async connect(webSocketUrl: string, token: string, mediaContainer: HTMLElement): Promise<void> {
    await this.disconnect();
    this.lastError.set(null);
    this.connectionState.set('connecting');
    this.mediaContainer = mediaContainer;

    const room = new Room({ adaptiveStream: true, dynacast: true });
    this.room = room;
    this.bindRoomEvents(room);

    try {
      await room.connect(webSocketUrl, token, { autoSubscribe: true });
      this.syncParticipantCount(room);
      setTimeout(() => this.syncParticipantCount(room), 500);
    } catch (error) {
      this.lastError.set(this.errorMessage(error));
      await this.disconnect();
      throw error;
    }
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    const room = this.requireConnectedRoom();
    await room.localParticipant.setMicrophoneEnabled(enabled);
    this.microphoneEnabled.set(enabled);
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    const room = this.requireConnectedRoom();
    await room.localParticipant.setCameraEnabled(enabled);
    this.cameraEnabled.set(enabled);
  }

  async setScreenShareEnabled(enabled: boolean): Promise<void> {
    const room = this.requireConnectedRoom();
    await room.localParticipant.setScreenShareEnabled(enabled);
    this.screenShareEnabled.set(enabled);
  }

  async disconnect(): Promise<void> {
    const room = this.room;
    this.room = null;

    if (room) {
      room.removeAllListeners();
      await room.disconnect(true);
    }

    this.mediaContainer?.replaceChildren();
    this.mediaContainer = null;
    this.connectionState.set('disconnected');
    this.participantCount.set(0);
    this.microphoneEnabled.set(false);
    this.cameraEnabled.set(false);
    this.screenShareEnabled.set(false);
  }

  private bindRoomEvents(room: Room): void {
    room
      .on(RoomEvent.ConnectionStateChanged, (state) => {
        this.connectionState.set(this.mapConnectionState(state));
      })
      .on(RoomEvent.ParticipantConnected, () => this.syncParticipantCount(room))
      .on(RoomEvent.ParticipantActive, () => this.syncParticipantCount(room))
      .on(RoomEvent.ParticipantDisconnected, () => this.syncParticipantCount(room))
      .on(RoomEvent.TrackSubscribed, (track) => {
        this.attachTrack(track, false);
        this.syncParticipantCount(room);
      })
      .on(RoomEvent.TrackUnsubscribed, (track) => this.detachTrack(track))
      .on(RoomEvent.LocalTrackPublished, (publication) => {
        const track = publication.track;
        if (track?.kind === Track.Kind.Video) {
          this.attachTrack(track, true);
        }
      })
      .on(RoomEvent.LocalTrackUnpublished, (publication) => {
        if (publication.track) {
          this.detachTrack(publication.track);
        }
        this.microphoneEnabled.set(room.localParticipant.isMicrophoneEnabled);
        this.cameraEnabled.set(room.localParticipant.isCameraEnabled);
        this.screenShareEnabled.set(room.localParticipant.isScreenShareEnabled);
      })
      .on(RoomEvent.Reconnecting, () => this.connectionState.set('reconnecting'))
      .on(RoomEvent.Reconnected, () => this.connectionState.set('connected'))
      .on(RoomEvent.Disconnected, () => this.connectionState.set('disconnected'));
  }

  private attachTrack(track: RemoteTrack | Track, muted: boolean): void {
    if (!this.mediaContainer) {
      return;
    }

    const element = track.attach();
    element.autoplay = true;
    element.setAttribute('playsinline', '');
    element.muted = muted;
    element.dataset['meetingTrack'] = track.sid ?? track.kind;
    this.mediaContainer.append(element);
  }

  private detachTrack(track: RemoteTrack | Track): void {
    for (const element of track.detach()) {
      element.remove();
    }
  }

  private syncParticipantCount(room: Room): void {
    this.participantCount.set(Math.max(room.numParticipants, room.remoteParticipants.size + 1));
  }

  private requireConnectedRoom(): Room {
    if (!this.room || this.room.state !== ConnectionState.Connected) {
      throw new Error('Join the LiveKit probe room before changing media.');
    }

    return this.room;
  }

  private mapConnectionState(state: ConnectionState): MeetingRoomConnectionState {
    if (state === ConnectionState.Connected) {
      return 'connected';
    }
    if (
      state === ConnectionState.Reconnecting ||
      state === ConnectionState.SignalReconnecting
    ) {
      return 'reconnecting';
    }
    if (state === ConnectionState.Connecting) {
      return 'connecting';
    }
    return 'disconnected';
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'LiveKit connection failed.';
  }
}
