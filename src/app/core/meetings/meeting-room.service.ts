import { Injectable, signal } from '@angular/core';
import {
  ConnectionQuality, ConnectionState, DisconnectReason, isBrowserSupported,
  Participant, RemoteTrack, Room, RoomEvent, Track,
} from 'livekit-client';

export type MeetingRoomConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface MeetingRoomParticipantView {
  identity: string; participantId: number | null; displayName: string;
  accessLevel: number | null; badgeLabel: string | null; isLocal: boolean;
  isSpeaking: boolean; microphoneEnabled: boolean; cameraEnabled: boolean;
  screenShareEnabled: boolean; audioTrackSid: string | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

export interface MeetingRoomJoinPreferences {
  microphoneEnabled: boolean; cameraEnabled: boolean;
  audioInputId?: string; videoInputId?: string; audioOutputId?: string;
}

export interface MeetingCollaborationAnnouncement { type: 'message' | 'note' | 'asset'; id?: number; version?: number; }

interface ParticipantMetadata { participantId?: number; accessLevel?: number; badgeLabel?: string | null; }

@Injectable({ providedIn: 'root' })
export class MeetingRoomService {
  private room: Room | null = null;
  private mediaContainer: HTMLElement | null = null;
  private previewStream: MediaStream | null = null;

  readonly connectionState = signal<MeetingRoomConnectionState>('disconnected');
  readonly participants = signal<MeetingRoomParticipantView[]>([]);
  readonly participantCount = signal(0);
  readonly microphoneEnabled = signal(false);
  readonly cameraEnabled = signal(false);
  readonly screenShareEnabled = signal(false);
  readonly audioInputDevices = signal<MediaDeviceInfo[]>([]);
  readonly videoInputDevices = signal<MediaDeviceInfo[]>([]);
  readonly audioOutputDevices = signal<MediaDeviceInfo[]>([]);
  readonly deviceError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly disconnectMessage = signal<string | null>(null);
  readonly lastError = signal<string | null>(null);
  readonly collaborationAnnouncement = signal<MeetingCollaborationAnnouncement | null>(null);

  isSupported(): boolean { return isBrowserSupported() && !!navigator.mediaDevices; }

  async loadDevices(requestPermissions = false): Promise<void> {
    this.deviceError.set(null);
    if (!this.isSupported()) {
      this.deviceError.set('This browser does not provide the WebRTC features required for calls.');
      return;
    }
    let permissionStream: MediaStream | null = null;
    try {
      if (requestPermissions) permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const [audioInputs, videoInputs, audioOutputs] = await Promise.all([
        Room.getLocalDevices('audioinput', false), Room.getLocalDevices('videoinput', false),
        Room.getLocalDevices('audiooutput', false),
      ]);
      this.audioInputDevices.set(audioInputs); this.videoInputDevices.set(videoInputs);
      this.audioOutputDevices.set(audioOutputs);
    } catch (error) {
      this.deviceError.set(this.deviceErrorMessage(error));
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [] as MediaDeviceInfo[]);
      this.audioInputDevices.set(devices.filter((device) => device.kind === 'audioinput'));
      this.videoInputDevices.set(devices.filter((device) => device.kind === 'videoinput'));
      this.audioOutputDevices.set(devices.filter((device) => device.kind === 'audiooutput'));
    } finally { permissionStream?.getTracks().forEach((track) => track.stop()); }
  }

  async preparePreview(video: HTMLVideoElement, cameraId?: string): Promise<void> {
    await this.stopPreview();
    if (!this.isSupported()) return;
    try {
      this.previewStream = await navigator.mediaDevices.getUserMedia({
        video: cameraId ? { deviceId: { exact: cameraId } } : true, audio: false,
      });
      video.srcObject = this.previewStream; video.muted = true; video.playsInline = true;
      await video.play().catch(() => undefined); await this.loadDevices(false);
    } catch (error) { this.deviceError.set(this.deviceErrorMessage(error)); }
  }

  async stopPreview(): Promise<void> {
    this.previewStream?.getTracks().forEach((track) => track.stop()); this.previewStream = null;
  }

  async connect(webSocketUrl: string, token: string, mediaContainer: HTMLElement,
    preferences: MeetingRoomJoinPreferences = { microphoneEnabled: false, cameraEnabled: false }): Promise<void> {
    await this.disconnect(); await this.stopPreview(); this.lastError.set(null); this.actionError.set(null);
    this.disconnectMessage.set(null); this.connectionState.set('connecting'); this.mediaContainer = mediaContainer;
    const room = new Room({ adaptiveStream: true, dynacast: true }); this.room = room; this.bindRoomEvents(room);
    try {
      await room.connect(webSocketUrl, token, { autoSubscribe: true });
      if (preferences.microphoneEnabled) await room.localParticipant.setMicrophoneEnabled(true);
      if (preferences.cameraEnabled) await room.localParticipant.setCameraEnabled(true);
      if (preferences.audioInputId) await room.switchActiveDevice('audioinput', preferences.audioInputId);
      if (preferences.videoInputId) await room.switchActiveDevice('videoinput', preferences.videoInputId);
      if (preferences.audioOutputId) await room.switchActiveDevice('audiooutput', preferences.audioOutputId, false);
      this.attachExistingTracks(room); this.syncRoom(room);
    } catch (error) {
      this.lastError.set(this.errorMessage(error)); await this.disconnect(); throw error;
    }
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    await this.runMediaAction(async (room) => room.localParticipant.setMicrophoneEnabled(enabled));
  }
  async setCameraEnabled(enabled: boolean): Promise<void> {
    await this.runMediaAction(async (room) => room.localParticipant.setCameraEnabled(enabled));
  }
  async setScreenShareEnabled(enabled: boolean): Promise<void> {
    await this.runMediaAction(async (room) => room.localParticipant.setScreenShareEnabled(enabled));
  }
  async switchDevice(kind: MediaDeviceKind, deviceId: string): Promise<void> {
    if (deviceId) await this.runMediaAction(async (room) => { await room.switchActiveDevice(kind, deviceId, false); });
  }
  async enableAudioPlayback(): Promise<void> { await this.runMediaAction(async (room) => room.startAudio()); }
  async announceCollaboration(value: MeetingCollaborationAnnouncement): Promise<void> {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    await this.requireConnectedRoom().localParticipant.publishData(bytes, { reliable: true, topic: 'taskflow.collaboration' });
  }

  async disconnect(): Promise<void> {
    const room = this.room; this.room = null;
    if (room) { room.removeAllListeners(); await room.disconnect(true); }
    await this.stopPreview(); this.mediaContainer?.replaceChildren(); this.mediaContainer = null;
    this.connectionState.set('disconnected'); this.participants.set([]); this.participantCount.set(0);
    this.microphoneEnabled.set(false); this.cameraEnabled.set(false); this.screenShareEnabled.set(false);
  }

  private bindRoomEvents(room: Room): void {
    room
      .on(RoomEvent.ConnectionStateChanged, (state) => this.connectionState.set(this.mapConnectionState(state)))
      .on(RoomEvent.ParticipantConnected, () => this.syncRoom(room))
      .on(RoomEvent.ParticipantDisconnected, (participant) => { this.removeParticipantTile(participant.identity); this.syncRoom(room); })
      .on(RoomEvent.ParticipantActive, () => this.syncRoom(room))
      .on(RoomEvent.ParticipantMetadataChanged, () => this.syncRoom(room))
      .on(RoomEvent.ParticipantNameChanged, () => this.syncRoom(room))
      .on(RoomEvent.ParticipantPermissionsChanged, () => this.syncRoom(room))
      .on(RoomEvent.ActiveSpeakersChanged, () => this.syncRoom(room))
      .on(RoomEvent.ConnectionQualityChanged, () => this.syncRoom(room))
      .on(RoomEvent.TrackMuted, () => this.syncRoom(room))
      .on(RoomEvent.TrackUnmuted, () => this.syncRoom(room))
      .on(RoomEvent.TrackSubscribed, (track, _publication, participant) => { this.attachTrack(track, participant); this.syncRoom(room); })
      .on(RoomEvent.TrackUnsubscribed, (track) => { this.detachTrack(track); this.syncRoom(room); })
      .on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
        if (topic !== 'taskflow.collaboration' || payload.byteLength > 2048) return;
        try { const value = JSON.parse(new TextDecoder().decode(payload)) as MeetingCollaborationAnnouncement;
          if (value?.type === 'message' || value?.type === 'note' || value?.type === 'asset') this.collaborationAnnouncement.set(value); }
        catch { /* Ignore malformed provider data; canonical state remains in the API. */ }
      })
      .on(RoomEvent.LocalTrackPublished, (publication, participant) => { if (publication.track) this.attachTrack(publication.track, participant); this.syncRoom(room); })
      .on(RoomEvent.LocalTrackUnpublished, (publication) => { if (publication.track) this.detachTrack(publication.track); this.syncRoom(room); })
      .on(RoomEvent.Reconnecting, () => this.connectionState.set('reconnecting'))
      .on(RoomEvent.Reconnected, () => { this.connectionState.set('connected'); this.syncRoom(room); })
      .on(RoomEvent.Disconnected, (reason) => { this.connectionState.set('disconnected'); this.disconnectMessage.set(this.disconnectReasonMessage(reason)); });
  }

  private attachExistingTracks(room: Room): void {
    for (const publication of room.localParticipant.trackPublications.values())
      if (publication.track) this.attachTrack(publication.track, room.localParticipant);
    for (const participant of room.remoteParticipants.values())
      for (const publication of participant.trackPublications.values())
        if (publication.track) this.attachTrack(publication.track, participant);
  }

  private attachTrack(track: RemoteTrack | Track, participant: Participant): void {
    if (!this.mediaContainer) return;
    const tile = this.ensureParticipantTile(participant); const element = track.attach();
    element.autoplay = true; element.setAttribute('playsinline', '');
    element.dataset['meetingTrack'] = track.sid ?? track.kind;
    if (participant === this.room?.localParticipant) element.muted = true;
    if (track.kind === Track.Kind.Audio) element.classList.add('meeting-audio-track');
    tile.querySelector('.meeting-media-surface')?.append(element);
  }
  private detachTrack(track: RemoteTrack | Track): void { for (const element of track.detach()) element.remove(); }

  private ensureParticipantTile(participant: Participant): HTMLElement {
    const selector = `[data-participant-identity="${CSS.escape(participant.identity)}"]`;
    const existing = this.mediaContainer!.querySelector<HTMLElement>(selector); if (existing) return existing;
    const tile = document.createElement('article'); tile.className = 'meeting-media-tile';
    tile.dataset['participantIdentity'] = participant.identity;
    const surface = document.createElement('div'); surface.className = 'meeting-media-surface';
    const fallback = document.createElement('span'); fallback.className = 'meeting-media-fallback';
    fallback.textContent = (participant.name || 'Participant').charAt(0).toUpperCase();
    const label = document.createElement('div'); label.className = 'meeting-media-label';
    label.textContent = participant.name || 'Participant'; surface.append(fallback); tile.append(surface, label);
    this.mediaContainer!.append(tile); return tile;
  }
  private removeParticipantTile(identity: string): void {
    this.mediaContainer?.querySelector(`[data-participant-identity="${CSS.escape(identity)}"]`)?.remove();
  }

  private syncRoom(room: Room): void {
    const all: Participant[] = [room.localParticipant, ...room.remoteParticipants.values()];
    const active = new Set(room.activeSpeakers.map((participant) => participant.identity));
    const views = all.map((participant) => this.participantView(participant, active));
    this.participants.set(views); this.participantCount.set(views.length);
    this.microphoneEnabled.set(room.localParticipant.isMicrophoneEnabled);
    this.cameraEnabled.set(room.localParticipant.isCameraEnabled);
    this.screenShareEnabled.set(room.localParticipant.isScreenShareEnabled);
    for (const participant of all) {
      const tile = this.ensureParticipantTile(participant); tile.classList.toggle('is-speaking', active.has(participant.identity));
      const label = tile.querySelector<HTMLElement>('.meeting-media-label');
      if (label) label.textContent = `${participant.name || 'Participant'}${participant === room.localParticipant ? ' · You' : ''}`;
    }
  }

  private participantView(participant: Participant, active: Set<string>): MeetingRoomParticipantView {
    const metadata = this.metadata(participant.metadata); const microphone = participant.getTrackPublication(Track.Source.Microphone);
    return {
      identity: participant.identity,
      participantId: typeof metadata.participantId === 'number' ? metadata.participantId : null,
      displayName: participant.name || 'Participant', accessLevel: typeof metadata.accessLevel === 'number' ? metadata.accessLevel : null,
      badgeLabel: typeof metadata.badgeLabel === 'string' ? metadata.badgeLabel : null,
      isLocal: participant === this.room?.localParticipant, isSpeaking: active.has(participant.identity),
      microphoneEnabled: !!microphone && !microphone.isMuted, cameraEnabled: participant.isCameraEnabled,
      screenShareEnabled: participant.isScreenShareEnabled, audioTrackSid: microphone?.trackSid ?? null,
      connectionQuality: this.connectionQuality(participant.connectionQuality),
    };
  }

  private metadata(value?: string): ParticipantMetadata {
    if (!value || value.length > 1000) return {};
    try { const parsed = JSON.parse(value) as ParticipantMetadata; return parsed && typeof parsed === 'object' ? parsed : {}; }
    catch { return {}; }
  }
  private async runMediaAction(action: (room: Room) => Promise<unknown>): Promise<void> {
    this.actionError.set(null);
    try { await action(this.requireConnectedRoom()); } catch (error) { this.actionError.set(this.deviceErrorMessage(error)); throw error; }
    if (this.room) this.syncRoom(this.room);
  }
  private requireConnectedRoom(): Room {
    if (!this.room || this.room.state !== ConnectionState.Connected) throw new Error('Reconnect to the meeting before changing media.');
    return this.room;
  }
  private mapConnectionState(state: ConnectionState): MeetingRoomConnectionState {
    if (state === ConnectionState.Connected) return 'connected';
    if (state === ConnectionState.Reconnecting || state === ConnectionState.SignalReconnecting) return 'reconnecting';
    if (state === ConnectionState.Connecting) return 'connecting'; return 'disconnected';
  }
  private connectionQuality(quality: ConnectionQuality): MeetingRoomParticipantView['connectionQuality'] {
    if (quality === ConnectionQuality.Excellent) return 'excellent'; if (quality === ConnectionQuality.Good) return 'good';
    if (quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost) return 'poor'; return 'unknown';
  }
  private disconnectReasonMessage(reason?: DisconnectReason): string | null {
    if (reason === DisconnectReason.PARTICIPANT_REMOVED) return 'A host removed you from this meeting.';
    if (reason === DisconnectReason.ROOM_DELETED) return 'The host ended this meeting.';
    if (reason === DisconnectReason.DUPLICATE_IDENTITY) return 'This meeting session was opened in another tab.';
    if (reason != null && reason !== DisconnectReason.CLIENT_INITIATED) return 'The room connection closed unexpectedly. Try joining again.';
    return null;
  }
  private deviceErrorMessage(error: unknown): string {
    if (error instanceof DOMException && error.name === 'NotAllowedError') return 'Camera or microphone permission was denied. You can still join with media off.';
    if (error instanceof DOMException && error.name === 'NotFoundError') return 'No matching camera or microphone is available.';
    return this.errorMessage(error);
  }
  private errorMessage(error: unknown): string { return error instanceof Error ? error.message : 'LiveKit connection failed.'; }
}
