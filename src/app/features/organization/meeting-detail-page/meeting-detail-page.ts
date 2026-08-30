import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, CalendarClock, FileText, Link2, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, MessageSquareText, Pencil, Play, Square, UserPlus, Users, Video } from 'lucide-angular';
import { DialogService } from '@core/services/dialog.service';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { MeetingAccessLevel, MeetingParticipantState, MeetingPayload, MeetingStatus, accessLevelLabel, meetingStatusMeta } from '../meetings.models';
import { MeetingsFacade } from '../meetings.facade';
import { OrganizationFacade } from '../organization.facade';
import { MeetingFormDrawer } from '../meetings-page/meeting-form-drawer';

@Component({ selector: 'app-meeting-detail-page', standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, Skeleton, MeetingFormDrawer],
  templateUrl: './meeting-detail-page.html', styleUrl: './meeting-detail-page.scss',
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ ArrowLeft, CalendarClock, FileText, Link2, MessageSquareText, Pencil, Play, Square, UserPlus, Users, Video }) }],
})
export class MeetingDetailPage {
  private readonly route = inject(ActivatedRoute); private readonly organization = inject(OrganizationFacade); readonly facade = inject(MeetingsFacade); private readonly dialog = inject(DialogService);
  readonly id = Number(this.route.snapshot.paramMap.get('id')); readonly detail = this.facade.detail;
  readonly currentOrg = this.organization.currentOrg; readonly members = this.organization.members;
  readonly loading = this.facade.detailLoading; readonly saving = this.facade.saving; readonly error = this.facade.detailError;
  readonly showEdit = signal(false); readonly showAddParticipant = signal(false);
  readonly participantUserId = signal<number | null>(null); readonly participantLevel = signal(MeetingAccessLevel.Participant); readonly participantBadgeId = signal<number | null>(null);
  readonly Status = MeetingStatus; readonly State = MeetingParticipantState; readonly Level = MeetingAccessLevel;
  readonly statusMeta = meetingStatusMeta; readonly accessLabel = accessLevelLabel;
  readonly availableMembers = computed(() => { const assigned = new Set(this.detail()?.participants.map((p) => p.userId) ?? []); return this.members().filter((m) => m.isActive && !assigned.has(m.userId)); });
  constructor() { this.organization.init(); effect(() => { const orgId = this.currentOrg()?.id; if (orgId) { this.facade.load(orgId); this.facade.loadDetail(this.id); } }); }
  update(payload: MeetingPayload): void { this.facade.update(this.id, payload, () => this.showEdit.set(false)); }
  async lifecycle(action: 'start' | 'end' | 'cancel'): Promise<void> { const label = action === 'start' ? 'Start meeting?' : action === 'end' ? 'End meeting?' : 'Cancel meeting?'; const detail = action === 'start' ? 'The meeting will become live. Calling is added in Phase 4; this records the lifecycle now.' : action === 'end' ? 'This closes the live meeting and moves it to the archive.' : 'This removes the meeting from the upcoming schedule.'; if (await this.dialog.confirm(label, detail, action === 'start' ? 'Start meeting' : action === 'end' ? 'End meeting' : 'Cancel meeting')) this.facade.lifecycle(this.id, action); }
  addParticipant(): void { const userId = this.participantUserId(); if (!userId) return; this.facade.addParticipant(this.id, userId, this.participantLevel(), this.participantBadgeId()); this.showAddParticipant.set(false); this.participantUserId.set(null); }
  async revoke(participantId: number, level: MeetingAccessLevel, badgeId: number | null): Promise<void> { if (await this.dialog.confirm('Revoke participant access?', 'They will no longer be able to view this meeting or its future archive.', 'Revoke access')) this.facade.revokeParticipant(this.id, participantId, level, badgeId); }
  formatDate(value: string | null): string { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) : 'Not scheduled'; }
  setParticipantUser(value: string): void { this.participantUserId.set(value ? Number(value) : null); }
  setParticipantLevel(value: string): void { this.participantLevel.set(Number(value) as MeetingAccessLevel); }
  setParticipantBadge(value: string): void { this.participantBadgeId.set(value ? Number(value) : null); }
  toggleParticipantForm(): void { this.showAddParticipant.update((open) => !open); }
  badgeLabel(id: number | null): string | null { return id == null ? null : this.detail()?.badges.find((badge) => badge.id === id)?.label ?? null; }
}
