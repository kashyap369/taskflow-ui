import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Download, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Play, Video } from 'lucide-angular';
import { MeetingRecording, MeetingRecordingStatus } from '@features/organization/meetings.models';
import { MeetingsGuestRepository } from '../meetings-guest.repository';

@Component({ selector: 'app-guest-archive-page', standalone: true, imports: [CommonModule, RouterLink, LucideAngularModule], templateUrl: './guest-archive-page.html', styleUrl: './guest-archive-page.scss', providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ Download, Play, Video }) }] })
export class GuestArchivePage implements OnDestroy {
  private readonly repository = inject(MeetingsGuestRepository); private readonly urls: string[] = [];
  readonly recordings = signal<MeetingRecording[]>([]); readonly playbackUrl = signal<string | null>(null); readonly loading = signal(true); readonly error = signal<string | null>(null); readonly Status = MeetingRecordingStatus;
  constructor() { const token = sessionStorage.getItem('taskflow.meeting.guest-session') ?? ''; if (!token) { this.loading.set(false); this.error.set('Your guest session expired. Verify the meeting invitation again.'); return; } this.repository.recordings(token).subscribe({ next: (rows) => { this.recordings.set(rows); this.loading.set(false); }, error: () => { this.loading.set(false); this.error.set('The meeting archive is unavailable or has expired.'); } }); }
  open(recording: MeetingRecording, download: boolean): void { const token = sessionStorage.getItem('taskflow.meeting.guest-session') ?? ''; this.repository.recordingContent(token, recording.id).subscribe((blob) => { const url = URL.createObjectURL(blob); this.urls.push(url); if (download) { const anchor = document.createElement('a'); anchor.href = url; anchor.download = `meeting-recording-${recording.id}.mp4`; anchor.click(); } else this.playbackUrl.set(url); }); }
  ngOnDestroy(): void { this.urls.forEach((url) => URL.revokeObjectURL(url)); }
}
