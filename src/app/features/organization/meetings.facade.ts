import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { resetOnSessionChange } from '@core/auth/session-reset';
import { NotificationService } from '@core/services/notification.service';
import { CreateMeetingAccessLinkPayload, MeetingAccessLevel, MeetingAccessLink, MeetingBadgeInput, MeetingDetail, MeetingListItem, MeetingParticipantState, MeetingPayload } from './meetings.models';
import { MeetingsRepository } from './meetings.repository';

@Injectable({ providedIn: 'root' })
export class MeetingsFacade {
  private readonly repository = inject(MeetingsRepository);
  private readonly notification = inject(NotificationService);
  private readonly _meetings = signal<MeetingListItem[]>([]);
  private readonly _detail = signal<MeetingDetail | null>(null);
  private readonly _listLoading = signal(false);
  private readonly _detailLoading = signal(false);
  private readonly _saving = signal(false);
  private readonly _listError = signal(false);
  private readonly _detailError = signal(false);
  private readonly _accessLinks = signal<MeetingAccessLink[]>([]);
  private organizationId: number | null = null;
  readonly meetings = this._meetings.asReadonly(); readonly detail = this._detail.asReadonly();
  readonly loading = this._listLoading.asReadonly(); readonly detailLoading = this._detailLoading.asReadonly();
  readonly saving = this._saving.asReadonly(); readonly error = this._listError.asReadonly();
  readonly detailError = this._detailError.asReadonly();
  readonly accessLinks = this._accessLinks.asReadonly();

  constructor() { resetOnSessionChange(() => this.clear()); }
  clear(): void { this.organizationId = null; this._meetings.set([]); this._detail.set(null); this._accessLinks.set([]); this._listLoading.set(false); this._detailLoading.set(false); this._saving.set(false); this._listError.set(false); this._detailError.set(false); }
  load(organizationId: number): void {
    this.organizationId = organizationId; this._meetings.set([]); this._listLoading.set(true); this._listError.set(false);
    const now = new Date(); const past = new Date(now); const future = new Date(now);
    past.setUTCDate(past.getUTCDate() - 365); future.setUTCDate(future.getUTCDate() + 365);
    forkJoin([
      this.loadWindow(organizationId, past.toISOString(), now.toISOString()),
      this.loadWindow(organizationId, now.toISOString(), future.toISOString()),
    ]).subscribe({
      next: (pages) => {
        if (this.organizationId !== organizationId) return;
        const unique = new Map(pages.flat().map((meeting) => [meeting.id, meeting]));
        this._meetings.set([...unique.values()]); this._listLoading.set(false);
      },
      error: () => { if (this.organizationId === organizationId) { this._listLoading.set(false); this._listError.set(true); } },
    });
  }
  loadDetail(id: number): void { this._detail.set(null); this._detailLoading.set(true); this._detailError.set(false);
    this.repository.detail(id).subscribe({ next: (detail) => { if (this.organizationId == null || detail.organizationId === this.organizationId) this._detail.set(detail); this._detailLoading.set(false); }, error: () => { this._detailLoading.set(false); this._detailError.set(true); } }); }
  create(organizationId: number, payload: MeetingPayload, done: (id: number) => void): void {
    this._saving.set(true); this.repository.create({ ...payload, organizationId }).subscribe({ next: (id) => { this._saving.set(false); this.notification.success('Meeting created.'); this.load(organizationId); done(id); }, error: () => this._saving.set(false) });
  }
  update(id: number, payload: MeetingPayload, done?: () => void): void { this._saving.set(true); this.repository.update(id, payload).subscribe({ next: () => { this._saving.set(false); this.notification.success('Meeting updated.'); this.loadDetail(id); done?.(); }, error: () => this._saving.set(false) }); }
  lifecycle(id: number, action: 'start' | 'end' | 'cancel'): void { this._saving.set(true); this.repository[action](id).subscribe({ next: () => { this._saving.set(false); this.notification.success(action === 'start' ? 'Meeting is live.' : action === 'end' ? 'Meeting ended.' : 'Meeting cancelled.'); this.loadDetail(id); if (this.organizationId) this.load(this.organizationId); }, error: () => this._saving.set(false) }); }
  addBadge(id: number, badge: MeetingBadgeInput, done?: () => void): void { this._saving.set(true); this.repository.addBadge(id, badge).subscribe({ next: () => { this._saving.set(false); this.notification.success('Meeting badge added.'); this.loadDetail(id); done?.(); }, error: () => this._saving.set(false) }); }
  addParticipant(id: number, userId: number, level: MeetingAccessLevel, badgeId: number | null): void { this._saving.set(true); this.repository.addParticipant(id, userId, level, badgeId).subscribe({ next: () => { this._saving.set(false); this.notification.success('Participant added.'); this.loadDetail(id); }, error: () => this._saving.set(false) }); }
  revokeParticipant(id: number, participantId: number, level: MeetingAccessLevel, badgeId: number | null): void { this._saving.set(true); this.repository.updateParticipant(id, participantId, level, badgeId, MeetingParticipantState.Revoked).subscribe({ next: () => { this._saving.set(false); this.notification.success('Participant access revoked.'); this.loadDetail(id); }, error: () => this._saving.set(false) }); }
  updateParticipantState(id: number, participantId: number, level: MeetingAccessLevel, badgeId: number | null, state: MeetingParticipantState): void { this._saving.set(true); this.repository.updateParticipant(id, participantId, level, badgeId, state).subscribe({ next: () => { this._saving.set(false); this.notification.success('Guest access updated.'); this.loadDetail(id); }, error: () => this._saving.set(false) }); }
  loadAccessLinks(id: number): void { this.repository.accessLinks(id).subscribe({ next: (links) => this._accessLinks.set(links), error: () => this._accessLinks.set([]) }); }
  createAccessLink(id: number, payload: CreateMeetingAccessLinkPayload, done: (url: string) => void): void { this._saving.set(true); this.repository.createAccessLink(id, payload).subscribe({ next: (created) => { this._saving.set(false); this.notification.success(payload.lockedEmail ? 'Invitation sent.' : 'Share link created.'); this.loadAccessLinks(id); done(`${location.origin}/meetings/join#token=${encodeURIComponent(created.token)}`); }, error: () => this._saving.set(false) }); }
  revokeAccessLink(id: number, linkId: number): void { this._saving.set(true); this.repository.revokeAccessLink(id, linkId).subscribe({ next: () => { this._saving.set(false); this.notification.success('Access link revoked.'); this.loadAccessLinks(id); }, error: () => this._saving.set(false) }); }
  rotateAccessLink(id: number, linkId: number, done: (url: string) => void): void { this._saving.set(true); this.repository.rotateAccessLink(id, linkId).subscribe({ next: (created) => { this._saving.set(false); this.notification.success('Access link rotated.'); this.loadAccessLinks(id); done(`${location.origin}/meetings/join#token=${encodeURIComponent(created.token)}`); }, error: () => this._saving.set(false) }); }

  private loadWindow(organizationId: number, fromUtc: string, toUtc: string): Observable<MeetingListItem[]> {
    const take = 100;
    return this.repository.list(organizationId, { fromUtc, toUtc, take }).pipe(
      switchMap((first) => {
        if (first.total <= first.items.length) return of(first.items);
        const requests = Array.from({ length: Math.ceil(first.total / take) - 1 }, (_, index) =>
          this.repository.list(organizationId, { fromUtc, toUtc, skip: (index + 1) * take, take }),
        );
        return forkJoin(requests).pipe(map((pages) => [first.items, ...pages.map((page) => page.items)].flat()));
      }),
    );
  }
}
