import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CalendarClock, LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Plus, Search, Users, Video } from 'lucide-angular';
import { Skeleton } from '@shared/ui/atoms/skeletons/skeleton/skeleton';
import { Pagination } from '@shared/ui/molecules/pagination/pagination';
import { createPagination } from '@shared/utils/pagination';
import { MeetingListItem, MeetingPayload, MeetingStatus, meetingStatusMeta } from '../meetings.models';
import { MeetingsFacade } from '../meetings.facade';
import { OrganizationFacade } from '../organization.facade';
import { MeetingFormDrawer } from './meeting-form-drawer';

type MeetingView = 'upcoming' | 'live' | 'past';
@Component({ selector: 'app-meetings-page', standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, Skeleton, Pagination, MeetingFormDrawer],
  templateUrl: './meetings-page.html', styleUrl: './meetings-page.scss',
  providers: [{ provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({ CalendarClock, Plus, Search, Users, Video }) }],
})
export class MeetingsPage {
  private readonly organization = inject(OrganizationFacade); readonly meetingsFacade = inject(MeetingsFacade); private readonly router = inject(Router);
  readonly currentOrg = this.organization.currentOrg; readonly needsOrganization = this.organization.needsOrganization;
  readonly canCreate = this.organization.canCreateMeetings; readonly meetings = this.meetingsFacade.meetings;
  readonly loading = this.meetingsFacade.loading; readonly saving = this.meetingsFacade.saving; readonly error = this.meetingsFacade.error;
  readonly activeView = signal<MeetingView>('upcoming'); readonly search = signal(''); readonly showCreate = signal(false);
  readonly statusFilter = signal<'' | MeetingStatus>(''); readonly statusMeta = meetingStatusMeta; readonly loadingRows = [0, 1, 2, 3];
  readonly filtered = computed(() => { const term = this.search().trim().toLowerCase(); const view = this.activeView(); const status = this.statusFilter();
    return this.meetings().filter((meeting) => { const inView = view === 'live' ? meeting.status === MeetingStatus.Live : view === 'past' ? meeting.status === MeetingStatus.Ended || meeting.status === MeetingStatus.Cancelled : meeting.status === MeetingStatus.Draft || meeting.status === MeetingStatus.Scheduled;
      return inView && (status === '' || meeting.status === status) && (!term || meeting.title.toLowerCase().includes(term) || meeting.description?.toLowerCase().includes(term) || meeting.creatorName.toLowerCase().includes(term));
    }).sort((a, b) => this.sortKey(a) - this.sortKey(b)); });
  readonly pager = createPagination(this.filtered, { pageSize: 8, pageSizes: [8, 16, 32] });
  readonly counts = computed(() => ({ upcoming: this.meetings().filter((m) => m.status === MeetingStatus.Draft || m.status === MeetingStatus.Scheduled).length, live: this.meetings().filter((m) => m.status === MeetingStatus.Live).length, past: this.meetings().filter((m) => m.status === MeetingStatus.Ended || m.status === MeetingStatus.Cancelled).length }));
  constructor() { this.organization.init(); effect(() => { const id = this.currentOrg()?.id; if (id) this.meetingsFacade.load(id); else this.meetingsFacade.clear(); }); }
  setView(view: MeetingView): void { this.activeView.set(view); this.statusFilter.set(''); this.pager.reset(); }
  setStatus(value: string): void { this.statusFilter.set(value ? Number(value) as MeetingStatus : ''); this.pager.reset(); }
  setSearch(value: string): void { this.search.set(value); this.pager.reset(); }
  countFor(view: MeetingView): number { return this.counts()[view]; }
  create(payload: MeetingPayload): void { const id = this.currentOrg()?.id; if (!id) return; this.meetingsFacade.create(id, payload, (meetingId) => { this.showCreate.set(false); void this.router.navigate(['/organization/meetings', meetingId]); }); }
  dateLabel(meeting: MeetingListItem): string { if (meeting.status === MeetingStatus.Draft) return 'Start when ready'; const value = meeting.scheduledStartUtc ?? meeting.actualStartUtc; return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Time not set'; }
  statusOptions(): MeetingStatus[] { return this.activeView() === 'upcoming' ? [MeetingStatus.Draft, MeetingStatus.Scheduled] : this.activeView() === 'past' ? [MeetingStatus.Ended, MeetingStatus.Cancelled] : [MeetingStatus.Live]; }
  private sortKey(meeting: MeetingListItem): number { const date = meeting.scheduledStartUtc ?? meeting.actualStartUtc ?? ''; const value = date ? new Date(date).getTime() : 0; return this.activeView() === 'past' ? -value : value; }
}
