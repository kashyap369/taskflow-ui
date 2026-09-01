import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileDown, FileText, History, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, MessageSquareText, Paperclip, Send, Trash2, Users } from 'lucide-angular';
import { MeetingArchive, MeetingAsset, MeetingAssetScanStatus, MeetingMessage, MeetingNote } from '@core/meetings/meeting-collaboration.models';
import { MeetingCollaborationRepository } from '@core/meetings/meeting-collaboration.repository';
import { MeetingRoomService } from '@core/meetings/meeting-room.service';

@Component({ selector: 'app-meeting-collaboration-panel', standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule], templateUrl: './meeting-collaboration-panel.html',
  styleUrl: './meeting-collaboration-panel.scss', providers: [{ provide: LUCIDE_ICONS, multi: true,
    useValue: new LucideIconProvider({ FileDown, FileText, History, MessageSquareText, Paperclip, Send, Trash2, Users }) }] })
export class MeetingCollaborationPanel implements OnInit, OnDestroy {
  private readonly repository = inject(MeetingCollaborationRepository); readonly room = inject(MeetingRoomService);
  readonly meetingId = input.required<number>(); readonly guestSessionToken = input<string | null>(null);
  readonly live = input(false); readonly compact = input(false);
  readonly tab = signal<'chat' | 'note' | 'files' | 'archive'>('chat'); readonly loading = signal(true);
  readonly error = signal<string | null>(null); readonly messages = signal<MeetingMessage[]>([]);
  readonly note = signal<MeetingNote>({ content: '', version: 0, lastEditedByParticipantId: null, lastEditedByName: null, updatedAt: null, canEdit: false });
  readonly assets = signal<MeetingAsset[]>([]); readonly archive = signal<MeetingArchive | null>(null);
  readonly messageDraft = signal(''); readonly noteDraft = signal(''); readonly noteState = signal<'saved' | 'saving' | 'conflict' | 'error'>('saved');
  readonly uploadBusy = signal(false); readonly Scan = MeetingAssetScanStatus;
  private noteTimer: ReturnType<typeof setTimeout> | null = null; private initialized = false;

  constructor() { effect(() => { const event = this.room.collaborationAnnouncement(); if (!this.initialized || !event) return;
    if (event.type === 'message') this.loadMessages(); else if (event.type === 'note') this.loadNote(false); else this.loadAssets(); }); }
  ngOnInit(): void { this.initialized = true; this.reload(); }
  ngOnDestroy(): void { if (this.noteTimer) clearTimeout(this.noteTimer); }
  reload(): void { this.loading.set(true); this.error.set(null); this.loadMessages(); this.loadNote(true); this.loadAssets(); this.loadArchive(); }
  send(): void { const body = this.messageDraft().trim(); if (!body || !this.live()) return; const clientId = crypto.randomUUID();
    this.repository.sendMessage(this.meetingId(), this.guestSessionToken(), clientId, body).subscribe({ next: (message) => { this.upsertMessage(message); this.messageDraft.set(''); void this.room.announceCollaboration({ type: 'message', id: message.id }).catch(() => undefined); }, error: () => this.error.set('Message could not be saved. Your draft is still here.') }); }
  updateNote(value: string): void { this.noteDraft.set(value); if (!this.live() || !this.note().canEdit) return; this.noteState.set('saving'); if (this.noteTimer) clearTimeout(this.noteTimer); this.noteTimer = setTimeout(() => this.saveNote(), 700); }
  upload(files: FileList | null): void { const file = files?.item(0); if (!file || !this.live()) return; this.uploadBusy.set(true); this.error.set(null);
    this.repository.upload(this.meetingId(), this.guestSessionToken(), file).subscribe({ next: (asset) => { this.assets.update((items) => [...items.filter((x) => x.id !== asset.id), asset]); this.uploadBusy.set(false); void this.room.announceCollaboration({ type: 'asset', id: asset.id }).catch(() => undefined); this.loadArchive(); }, error: () => { this.uploadBusy.set(false); this.error.set('File upload failed. Use PDF, PNG, JPEG, TXT or DOCX up to 25 MB.'); } }); }
  download(asset: MeetingAsset): void { this.repository.download(this.meetingId(), this.guestSessionToken(), asset.id).subscribe({ next: (blob) => { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = asset.fileName; anchor.click(); URL.revokeObjectURL(url); }, error: () => this.error.set('This file could not be downloaded.') }); }
  remove(asset: MeetingAsset): void { if (!asset.canDelete) return; this.repository.delete(this.meetingId(), this.guestSessionToken(), asset.id).subscribe({ next: () => { this.assets.update((items) => items.filter((x) => x.id !== asset.id)); this.loadArchive(); }, error: () => this.error.set('This file could not be deleted.') }); }
  formatBytes(value: number): string { return value < 1024 ? `${value} B` : value < 1048576 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1048576).toFixed(1)} MB`; }
  formatDate(value: string | null): string { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'In progress'; }
  duration(seconds: number): string { const minutes = Math.max(0, Math.round(seconds / 60)); return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`; }
  private loadMessages(): void { this.repository.messages(this.meetingId(), this.guestSessionToken()).subscribe({ next: (page) => { this.messages.set(page.items); this.loading.set(false); }, error: () => { this.loading.set(false); this.error.set('Collaboration history could not be loaded.'); } }); }
  private loadNote(resetDraft: boolean): void { this.repository.note(this.meetingId(), this.guestSessionToken()).subscribe({ next: (note) => { this.note.set(note); if (resetDraft || this.noteState() !== 'saving') this.noteDraft.set(note.content); this.noteState.set('saved'); }, error: () => this.error.set('The shared note could not be loaded.') }); }
  private loadAssets(): void { this.repository.assets(this.meetingId(), this.guestSessionToken()).subscribe({ next: (assets) => this.assets.set(assets), error: () => this.error.set('Meeting files could not be loaded.') }); }
  private loadArchive(): void { this.repository.archive(this.meetingId(), this.guestSessionToken()).subscribe({ next: (archive) => this.archive.set(archive), error: () => undefined }); }
  private saveNote(): void { this.repository.saveNote(this.meetingId(), this.guestSessionToken(), this.noteDraft(), this.note().version).subscribe({ next: (note) => { this.note.set(note); this.noteState.set('saved'); void this.room.announceCollaboration({ type: 'note', version: note.version }).catch(() => undefined); this.loadArchive(); }, error: (error) => { if (error?.status === 409) { this.noteState.set('conflict'); this.loadNote(true); } else this.noteState.set('error'); } }); }
  private upsertMessage(message: MeetingMessage): void { this.messages.update((items) => [...items.filter((x) => x.id !== message.id && x.clientMessageId !== message.clientMessageId), message].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id)); }
}
