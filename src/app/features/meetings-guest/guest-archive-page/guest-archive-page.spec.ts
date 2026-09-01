import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GuestArchivePage } from './guest-archive-page';
import { MeetingsGuestRepository } from '../meetings-guest.repository';

describe('GuestArchivePage', () => {
  it('loads the scoped recording list', async () => {
    sessionStorage.setItem('taskflow.meeting.guest-session', 'session');
    await TestBed.configureTestingModule({ imports: [GuestArchivePage], providers: [provideRouter([]), { provide: MeetingsGuestRepository, useValue: { recordings: () => of([]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(GuestArchivePage); fixture.detectChanges();
    expect(fixture.componentInstance.recordings()).toEqual([]);
    sessionStorage.removeItem('taskflow.meeting.guest-session');
  });
});
