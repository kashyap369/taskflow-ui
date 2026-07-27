import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { AccountType, SYSTEM_ROLE } from '@core/auth/roles.enum';
import { User } from '@core/models/user.model';
import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';

import { OrganizationFacade } from './organization.facade';
import { OrganizationRepository } from './organization.repository';
import { OrganizationStatus } from './organization.models';

function user(id: number, fullName: string): User {
  return {
    id,
    fullName,
    email: `user${id}@taskflow.test`,
    roles: [SYSTEM_ROLE.User],
    accountType: AccountType.Organization,
  };
}

const NADIA_ORGS = [
  { id: 2, name: 'Northwind Labs', ownerUserId: 3, status: OrganizationStatus.Active },
];
const OTHER_ORGS = [{ id: 9, name: 'Contoso', ownerUserId: 7, status: OrganizationStatus.Active }];

describe('OrganizationFacade — session scoping', () => {
  let facade: OrganizationFacade;
  let auth: AuthService;
  let getMyOrganizations: jasmine.Spy;

  beforeEach(() => {
    getMyOrganizations = jasmine.createSpy('getMyOrganizations').and.returnValue(of(NADIA_ORGS));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
        {
          provide: OrganizationRepository,
          useValue: {
            getMyOrganizations,
            getDashboard: () => of(null),
            getProjects: () => of([]),
            getTasks: () => of([]),
            getRoles: () => of([]),
            getMembers: () => of([]),
            getInvitations: () => of([]),
            getTeams: () => of([]),
            getPermissionCatalog: () => of([]),
          },
        },
      ],
    });

    auth = TestBed.inject(AuthService);
    facade = TestBed.inject(OrganizationFacade);
  });

  /**
   * The facade is a root singleton whose `init()` no-ops once `_loaded` is true. Without a reset on
   * session change, the second account inherits the first account's workspace — wrong, and a small
   * data leak between accounts.
   */
  it('drops the previous account’s data when the signed-in user changes', () => {
    auth.setUser(user(3, 'Nadia Owens'));
    facade.init();
    TestBed.tick();

    expect(facade.organizations().length).toBe(1);
    expect(facade.currentOrg()?.name).toBe('Northwind Labs');

    // A different principal signs in (e.g. after signing out and back in as someone else).
    getMyOrganizations.and.returnValue(of(OTHER_ORGS));
    auth.setUser(user(7, 'Someone Else'));
    TestBed.tick();

    // Stale state is gone, and `init()` is allowed to refetch rather than no-opping on `_loaded`.
    expect(facade.currentOrg()).toBeNull();

    facade.init();
    TestBed.tick();
    expect(facade.organizations()).toEqual(OTHER_ORGS);
    expect(facade.currentOrg()?.name).toBe('Contoso');
  });

  it('clears everything on sign-out, so nothing survives into the next session', () => {
    auth.setUser(user(3, 'Nadia Owens'));
    facade.init();
    TestBed.tick();
    expect(facade.organizations().length).toBe(1);

    auth.endSession();
    TestBed.tick();

    expect(facade.organizations()).toEqual([]);
    expect(facade.currentOrg()).toBeNull();
    expect(facade.summary()).toBeNull();
    expect(facade.tasks()).toEqual([]);
    expect(facade.members()).toEqual([]);
    expect(facade.teams()).toEqual([]);
  });

  // Signed-out → signed-in has nothing stale to drop, and resetting there would race with the
  // `init()` the destination page has already started.
  it('does not reset on the initial sign-in', () => {
    facade.init();
    TestBed.tick();
    expect(facade.organizations().length).toBe(1);

    auth.setUser(user(3, 'Nadia Owens'));
    TestBed.tick();

    expect(facade.organizations().length).toBe(1);
    expect(facade.currentOrg()?.name).toBe('Northwind Labs');
  });
});
