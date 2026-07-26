import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLottieOptions } from 'ngx-lottie';
import { of } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { OrganizationRepository } from '../organization.repository';
import { OrganizationStatus, TeamDetail } from '../organization.models';
import { TeamDetailPage } from './team-detail-page';

const TEAM: TeamDetail = {
  id: 2,
  organizationId: 2,
  name: 'Engineering',
  description: 'Builds the product',
  members: [
    { userId: 2, fullName: 'Jane Doe', email: 'jane@example.com', joinedAt: '2026-07-01T00:00:00Z' },
    {
      userId: 3,
      fullName: 'Sam Patel',
      email: 'sam@northwind.test',
      joinedAt: '2026-07-05T00:00:00Z',
    },
  ],
};

/** Stubs the org-wide `init()` fan-out plus `GET /team/{id}`. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () => of([]),
  getTasks: () => of([]),
  getRoles: () => of([]),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
  getTeam: () => of(TEAM),
};

describe('TeamDetailPage', () => {
  let component: TeamDetailPage;
  let fixture: ComponentFixture<TeamDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamDetailPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        provideLottieOptions({ player: () => import('lottie-web') }),
        { provide: APP_SETTINGS, useValue: AppSettings },
        { provide: OrganizationRepository, useValue: repositoryStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters the team members by name or email', () => {
    expect(component.pager.total()).toBe(2);

    component.onSearch('jane');
    expect(component.filteredMembers().map((m) => m.userId)).toEqual([2]);

    component.onSearch('northwind.test');
    expect(component.filteredMembers().map((m) => m.userId)).toEqual([3]);

    component.clearFilters();
    expect(component.pager.total()).toBe(2);
  });

  it('reports a validation message from the decorated team model', () => {
    component.openEdit();
    component.editForm.controls.name.setValue('');
    component.editForm.controls.name.markAsTouched();

    expect(component.fieldError('name')).toBe('A team name is required.');
  });
});
