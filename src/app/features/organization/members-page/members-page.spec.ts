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
import { OrganizationMember, OrganizationStatus } from '../organization.models';
import { MembersPage } from './members-page';

const member = (id: number, name: string, email: string, isActive: boolean): OrganizationMember => ({
  id,
  organizationId: 2,
  userId: id,
  userFullName: name,
  email,
  organizationRoleId: 1,
  roleName: 'Manager',
  isActive,
  joinedAt: '2026-07-01T00:00:00Z',
});

const MEMBERS: OrganizationMember[] = [
  member(1, 'Jane Doe', 'jane@example.com', true),
  member(2, 'John Smith', 'john@example.com', false),
  ...Array.from({ length: 10 }, (_, i) =>
    member(100 + i, `Member ${i + 1}`, `member${i + 1}@example.com`, true),
  ),
];

/** Stubs every call `OrganizationFacade.init()` fans out to, so the page gets real signal data. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () => of([]),
  getTasks: () => of([]),
  getRoles: () => of([{ id: 1, organizationId: 2, name: 'Manager', description: null }]),
  getMembers: () => of(MEMBERS),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
};

describe('MembersPage', () => {
  let component: MembersPage;
  let fixture: ComponentFixture<MembersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersPage],
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

    fixture = TestBed.createComponent(MembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('searches by name and email', () => {
    component.onSearch('jane');
    expect(component.filteredMembers().length).toBe(1);

    component.onSearch('john@example.com');
    expect(component.filteredMembers()[0].userFullName).toBe('John Smith');
  });

  it('filters by membership state', () => {
    component.onActiveFilter('inactive');
    expect(component.filteredMembers().length).toBe(1);
    expect(component.filteredMembers()[0].userFullName).toBe('John Smith');

    component.onActiveFilter('active');
    expect(component.filteredMembers().length).toBe(11);
  });

  it('pages the member list ten at a time', () => {
    expect(component.pager.total()).toBe(12);
    expect(component.pager.items().length).toBe(10);

    component.pager.setPage(2);
    expect(component.pager.items().length).toBe(2);
  });

  it('clears the filters', () => {
    component.onSearch('jane');
    component.onActiveFilter('active');

    component.clearFilters();

    expect(component.filteredMembers().length).toBe(12);
  });
});
