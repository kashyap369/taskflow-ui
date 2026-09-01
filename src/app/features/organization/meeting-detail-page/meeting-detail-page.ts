import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, CalendarClock, Check, Copy, FileText, Link2, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Mail, MessageSquareText, Pencil, Play, RefreshCw, Square, Trash2, UserPlus, Users, Video } from 'lucide-angular';
import { DialogService } from '@core/services/dialog.service';
import { NotificationService } from '@core/services/notification.service';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { CreateMeetingAccessLinkPayload, MeetingAccessLevel, MeetingAccessLinkMode, MeetingParticipantState, MeetingPayload, MeetingStatus, accessLevelLabel, meetingStatusMeta } from '../meetings.models';
import { MeetingsFacade } from '../meetings.facade';
import { OrganizationFacade } from '../organization.facade';
import { MeetingFormDrawer } from '../meetings-page/meeting-form-drawer';
import { MeetingCollaborationPanel } from '@shared/ui/organisms/meeting-collaboration-panel/meeting-collaboration-panel';

@Component({ selector: 'app-meeting-detail-page', standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, Skeleton, MeetingFormDrawer, MeetingCollaborationPanel],
  templateUrl: './meeting-detail-page.html', styleUrls: ['./meeting-detail-page.scss', './meeting-access.scss'],
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ ArrowLeft, CalendarClock, Check, Copy, FileText, Link2, Mail, MessageSquareText, Pencil, Play, RefreshCw, Square, Trash2, UserPlus, Users, Video }) }],
})
export class MeetingDetailPage {
  private readonly route = inject(ActivatedRoute); private readonly organization = inject(OrganizationFacade); readonly facade = inject(MeetingsFacade); private readonly dialog = inject(DialogService); private readonly notification = inject(NotificationService);
  readonly id = Number(this.route.snapshot.paramMap.get('id')); readonly detail = this.facade.detail;
  readonly currentOrg = this.organization.currentOrg; readonly members = this.organization.members;
  readonly loading = this.facade.detailLoading; readonly saving = this.facade.saving; readonly error = this.facade.detailError;
  readonly showEdit = signal(false); readonly showAddParticipant = signal(false); readonly showLinkForm = signal(false); readonly showBadgeForm = signal(false);
  readonly badgeLabelInput = signal(''); readonly badgeColor = signal('indigo'); readonly badgeIcon = signal('');
  readonly linkMode = signal(MeetingAccessLinkMode.PrivateInvitation); readonly linkEmail = signal('');
  readonly linkLevel = signal(MeetingAccessLevel.Participant); readonly linkBadgeId = signal<number | null>(null);
  readonly linkExpiry = signal(this.defaultExpiry()); readonly linkMaximumUses = signal<number | null>(1);
  readonly freshLink = signal<string | null>(null);
  readonly participantUserId = signal<number | null>(null); readonly participantLevel = signal(MeetingAccessLevel.Participant); readonly participantBadgeId = signal<number | null>(null);
  readonly Status = MeetingStatus; readonly State = MeetingParticipantState; readonly Level = MeetingAccessLevel; readonly LinkMode = MeetingAccessLinkMode;
  readonly accessLinks = this.facade.accessLinks;
  readonly statusMeta = meetingStatusMeta; readonly accessLabel = accessLevelLabel;
  readonly availableMembers = computed(() => { const assigned = new Set(this.detail()?.participants.map((p) => p.userId) ?? []); return this.members().filter((m) => m.isActive && !assigned.has(m.userId)); });
  constructor() { this.organization.init(); effect(() => { const orgId = this.currentOrg()?.id; if (orgId) { this.facade.load(orgId); this.facade.loadDetail(this.id); this.facade.loadAccessLinks(this.id); } }); }
  update(payload: MeetingPayload): void { this.facade.update(this.id, payload, () => this.showEdit.set(false)); }
  async lifecycle(action: 'start' | 'end' | 'cancel'): Promise<void> { const label = action === 'start' ? 'Start meeting?' : action === 'end' ? 'End meeting?' : 'Cancel meeting?'; const detail = action === 'start' ? 'The meeting will become live. Calling is added in Phase 4; this records the lifecycle now.' : action === 'end' ? 'This closes the live meeting and moves it to the archive.' : 'This removes the meeting from the upcoming schedule.'; if (await this.dialog.confirm(label, detail, action === 'start' ? 'Start meeting' : action === 'end' ? 'End meeting' : 'Cancel meeting')) this.facade.lifecycle(this.id, action); }
  addParticipant(): void { const userId = this.participantUserId(); if (!userId) return; this.facade.addParticipant(this.id, userId, this.participantLevel(), this.participantBadgeId()); this.showAddParticipant.set(false); this.participantUserId.set(null); }
  async revoke(participantId: number, level: MeetingAccessLevel, badgeId: number | null): Promise<void> { if (await this.dialog.confirm('Revoke participant access?', 'They will no longer be able to view this meeting or its future archive.', 'Revoke access')) this.facade.revokeParticipant(this.id, participantId, level, badgeId); }
  setGuestState(participantId: number, level: MeetingAccessLevel, badgeId: number | null, value: string): void { this.facade.updateParticipantState(this.id, participantId, level, badgeId, Number(value) as MeetingParticipantState); }
  addBadge(): void { const label = this.badgeLabelInput().trim(); if (!label) return; this.facade.addBadge(this.id, { label, color: this.badgeColor(), icon: this.badgeIcon().trim() || null }, () => { this.badgeLabelInput.set(''); this.badgeIcon.set(''); this.showBadgeForm.set(false); }); }
  createLink(): void {
    const expires = new Date(this.linkExpiry()); if (Number.isNaN(expires.getTime())) return;
    const reusable = this.linkMode() === MeetingAccessLinkMode.Reusable;
    const payload: CreateMeetingAccessLinkPayload = { mode: this.linkMode(), lockedEmail: reusable ? null : this.linkEmail().trim(), defaultAccessLevel: this.linkLevel(), badgeDefinitionId: this.linkBadgeId(), expiresAtUtc: expires.toISOString(), maximumUses: reusable ? this.linkMaximumUses() : 1 };
    this.facade.createAccessLink(this.id, payload, (url) => { this.freshLink.set(url); this.showLinkForm.set(false); });
  }
  setLinkMode(value: string): void { const mode = Number(value) as MeetingAccessLinkMode; this.linkMode.set(mode); this.linkMaximumUses.set(mode === MeetingAccessLinkMode.PrivateInvitation ? 1 : 25); }
  setLinkLevel(value: string): void { this.linkLevel.set(Number(value) as MeetingAccessLevel); }
  setLinkBadge(value: string): void { this.linkBadgeId.set(value ? Number(value) : null); }
  setLinkMax(value: string): void { this.linkMaximumUses.set(value ? Number(value) : null); }
  async copyFreshLink(): Promise<void> { const value = this.freshLink(); if (!value) return; await navigator.clipboard.writeText(value); this.notification.success('Link copied.'); }
  async revokeLink(linkId: number): Promise<void> { if (await this.dialog.confirm('Revoke this access link?', 'New guest sessions cannot be created from it. Existing admitted guests can be removed separately.', 'Revoke link')) this.facade.revokeAccessLink(this.id, linkId); }
  async rotateLink(linkId: number): Promise<void> { if (await this.dialog.confirm('Rotate this access link?', 'The current link stops working immediately and a replacement is shown once.', 'Rotate link')) this.facade.rotateAccessLink(this.id, linkId, (url) => this.freshLink.set(url)); }
  formatDate(value: string | null): string { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) : 'Not scheduled'; }
  setParticipantUser(value: string): void { this.participantUserId.set(value ? Number(value) : null); }
  setParticipantLevel(value: string): void { this.participantLevel.set(Number(value) as MeetingAccessLevel); }
  setParticipantBadge(value: string): void { this.participantBadgeId.set(value ? Number(value) : null); }
  toggleParticipantForm(): void { this.showAddParticipant.update((open) => !open); }
  toggleLinkForm(): void { this.showLinkForm.update((open) => !open); }
  toggleBadgeForm(): void { this.showBadgeForm.update((open) => !open); }
  badgeLabel(id: number | null): string | null { return id == null ? null : this.detail()?.badges.find((badge) => badge.id === id)?.label ?? null; }
  linkModeLabel(mode: MeetingAccessLinkMode): string { return mode === MeetingAccessLinkMode.PrivateInvitation ? 'Private invitation' : 'Reusable link'; }
  participantStateLabel(state: MeetingParticipantState): string { return ({ [MeetingParticipantState.Invited]: 'Waiting for host', [MeetingParticipantState.Admitted]: 'Admitted', [MeetingParticipantState.Revoked]: 'Revoked', [MeetingParticipantState.Denied]: 'Denied', [MeetingParticipantState.Removed]: 'Removed' })[state]; }
  private defaultExpiry(): string { const date = new Date(Date.now() + 7 * 86400000); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }
}
