import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLottieOptions } from 'ngx-lottie';
import { of } from 'rxjs';

import { AdminRepository } from '../admin.repository';
import { AccountType, AdminUser, UserStatus } from '../admin.models';
import { AdminUsersPage } from './users-page';

const USERS: AdminUser[] = [
  { id: 1, fullName: 'Ada Lovelace', email: 'ada@taskflow.com', status: UserStatus.Active, accountType: AccountType.Organization },
  { id: 2, fullName: 'Grace Hopper', email: 'grace@taskflow.com', status: UserStatus.PendingVerification, accountType: AccountType.Individual },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: 100 + i,
    fullName: `Filler User ${i + 1}`,
    email: `filler${i + 1}@taskflow.com`,
    status: UserStatus.Active,
    accountType: AccountType.Individual,
  })),
];

describe('AdminUsersPage', () => {
  let component: AdminUsersPage;
  let fixture: ComponentFixture<AdminUsersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [
        provideToastr(),
        provideAnimations(),
        provideLottieOptions({ player: () => import('lottie-web') }),
        { provide: AdminRepository, useValue: { getUsers: () => of(USERS) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads users and derives stats', () => {
    expect(component.totalUsers()).toBe(14);
    expect(component.activeUsers()).toBe(13);
    expect(component.pendingUsers()).toBe(1);
    expect(component.organizationAccounts()).toBe(1);
  });

  it('filters by search term', () => {
    component.onSearch('grace');
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].email).toBe('grace@taskflow.com');
  });

  it('filters by status', () => {
    component.onStatusFilter(String(UserStatus.PendingVerification));
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].fullName).toBe('Grace Hopper');
  });

  it('pages the filtered rows ten at a time', () => {
    expect(component.pager.total()).toBe(14);
    expect(component.pager.totalPages()).toBe(2);
    expect(component.pager.items().length).toBe(10);

    component.pager.setPage(2);
    expect(component.pager.items().length).toBe(4);
  });

  it('drops back to page 1 when a filter shrinks the list', () => {
    component.pager.setPage(2);
    component.onSearch('grace');

    expect(component.pager.page()).toBe(1);
    expect(component.pager.items().length).toBe(1);
  });

  it('clears every filter at once', () => {
    component.onSearch('grace');
    component.onStatusFilter(String(UserStatus.PendingVerification));
    component.onTypeFilter(String(AccountType.Individual));

    component.clearFilters();

    expect(component.filteredUsers().length).toBe(14);
  });
});
