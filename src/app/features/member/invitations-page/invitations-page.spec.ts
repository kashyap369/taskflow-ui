import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { DialogService } from '@core/services/dialog.service';
import { InvitationStatus, OrganizationInvitation } from '@shared/models/invitation.model';
import { MemberRepository } from '../member.repository';
import { MemberInvitationsPage } from './invitations-page';

const DAY = 24 * 60 * 60 * 1000;

const invite = (id: number, organizationName: string, expiryOffsetMs: number): OrganizationInvitation => ({
  id,
  organizationId: 2,
  organizationName,
  email: 'jane@example.com',
  organizationRoleId: 1,
  roleName: 'Manager',
  status: InvitationStatus.Pending,
  expiryDate: new Date(Date.now() + expiryOffsetMs).toISOString(),
  createdAt: '2026-07-24T00:00:00Z',
});

const INVITATIONS: OrganizationInvitation[] = [
  invite(1, 'Northwind Labs', 5 * DAY),
  invite(2, 'Stale Corp', -2 * DAY),
];

const getMyInvitations = jasmine.createSpy('getMyInvitations').and.returnValue(of(INVITATIONS));
const getMyOrganizations = jasmine.createSpy('getMyOrganizations').and.returnValue(of([]));
const acceptInvitation = jasmine.createSpy('acceptInvitation').and.returnValue(of(void 0));
const rejectInvitation = jasmine.createSpy('rejectInvitation').and.returnValue(of(void 0));

const repositoryStub = {
  getMyInvitations,
  getMyOrganizations,
  acceptInvitation,
  rejectInvitation,
};

describe('MemberInvitationsPage', () => {
  let component: MemberInvitationsPage;
  let fixture: ComponentFixture<MemberInvitationsPage>;

  beforeEach(async () => {
    getMyInvitations.calls.reset();
    getMyInvitations.and.returnValue(of(INVITATIONS));
    getMyOrganizations.calls.reset();
    getMyOrganizations.and.returnValue(of([]));
    acceptInvitation.calls.reset();
    acceptInvitation.and.returnValue(of(void 0));
    rejectInvitation.calls.reset();
    rejectInvitation.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [MemberInvitationsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
        { provide: MemberRepository, useValue: repositoryStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberInvitationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the current user’s invitations once', () => {
    expect(getMyInvitations).toHaveBeenCalledTimes(1);
    expect(component.invitations().length).toBe(2);
    expect(component.hasInvitations()).toBeTrue();
  });

  it('splits actionable invitations from expired ones', () => {
    expect(component.actionable().map((i) => i.organizationName)).toEqual(['Northwind Labs']);
    expect(component.expired().map((i) => i.organizationName)).toEqual(['Stale Corp']);
  });

  it('accepts an invitation and reloads the list', () => {
    component.accept(INVITATIONS[0]);

    expect(acceptInvitation).toHaveBeenCalledWith(1);
    expect(getMyInvitations).toHaveBeenCalledTimes(2);
    expect(getMyOrganizations).toHaveBeenCalledTimes(2);
  });

  it('still reloads when accepting fails (e.g. 409 already a member)', () => {
    acceptInvitation.and.returnValue(throwError(() => new Error('409')));

    component.accept(INVITATIONS[0]);

    expect(getMyInvitations).toHaveBeenCalledTimes(2);
    expect(component.saving()).toBeFalse();
  });

  it('declines only after the confirm dialog resolves true', async () => {
    const dialog = TestBed.inject(DialogService);
    const confirmSpy = spyOn(dialog, 'confirm').and.resolveTo(false);

    await component.decline(INVITATIONS[0]);
    expect(rejectInvitation).not.toHaveBeenCalled();

    confirmSpy.and.resolveTo(true);
    await component.decline(INVITATIONS[0]);
    expect(rejectInvitation).toHaveBeenCalledWith(1);
  });

  it('builds organization initials for the avatar', () => {
    expect(component.initials('Northwind Labs')).toBe('NL');
    expect(component.initials('Acme')).toBe('A');
  });
});
