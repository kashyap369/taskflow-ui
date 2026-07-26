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
import { AccountType } from '@core/auth/roles.enum';
import { AuthStore } from '@core/auth/auth.store';
import { DialogService } from '@core/services/dialog.service';
import { OrganizationRepository } from '../organization.repository';
import { OrganizationDetail, OrganizationStatus } from '../organization.models';
import { SettingsPage } from './settings-page';

const OWNER_ID = 1;

const ORG_DETAIL: OrganizationDetail = {
  id: 2,
  name: 'Northwind Labs',
  description: 'The test workspace',
  ownerUserId: OWNER_ID,
  status: OrganizationStatus.Active,
  memberCount: 3,
  createdAt: '2026-07-01T10:00:00Z',
};

const updateOrganization = jasmine.createSpy('updateOrganization').and.returnValue(of(void 0));
const deleteOrganization = jasmine.createSpy('deleteOrganization').and.returnValue(of(void 0));

/** Stubs every call `OrganizationFacade.init()` fans out to, so the page gets real signal data. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: OWNER_ID, status: OrganizationStatus.Active }]),
  getOrganization: () => of(ORG_DETAIL),
  getDashboard: () => of(null),
  getProjects: () => of([]),
  getTasks: () => of([]),
  getRoles: () => of([]),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
  updateOrganization,
  deleteOrganization,
};

/** Signs a user in so `isCurrentOrgOwner` can resolve; `userId` decides owner vs non-owner. */
function signIn(userId: number): void {
  TestBed.inject(AuthStore).setUser({
    id: userId,
    fullName: 'Nadia Owens',
    email: 'nadia.owens+org1@taskflow.test',
    roles: ['User'],
    accountType: AccountType.Organization,
  });
}

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(async () => {
    updateOrganization.calls.reset();
    deleteOrganization.calls.reset();

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
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
  });

  /** Create the component after the session is seeded (ownership drives the form's enabled state). */
  function render(userId = OWNER_ID): void {
    signIn(userId);
    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    render();
    expect(component).toBeTruthy();
  });

  it('fills the form from the loaded detail, not the list DTO', () => {
    render();

    expect(component.orgDetail()).toEqual(ORG_DETAIL);
    expect(component.form.getRawValue()).toEqual({
      name: 'Northwind Labs',
      description: 'The test workspace',
    });
    expect(component.loadingDetail()).toBeFalse();
  });

  it('sends the edited name and the loaded description on save', () => {
    render();
    component.form.controls.name.setValue('Northwind Group');
    component.save();

    expect(updateOrganization).toHaveBeenCalledWith({
      organizationId: 2,
      name: 'Northwind Group',
      description: 'The test workspace',
    });
  });

  it('does not save an invalid form', () => {
    render();
    component.form.controls.name.setValue('');
    component.save();

    expect(updateOrganization).not.toHaveBeenCalled();
  });

  it('restores the loaded values on discard', () => {
    render();
    component.form.controls.name.setValue('Something else');
    component.reset();

    expect(component.form.controls.name.value).toBe('Northwind Labs');
    expect(component.form.pristine).toBeTrue();
  });

  it('deletes only after the type-to-confirm dialog resolves true', async () => {
    render();
    const dialog = TestBed.inject(DialogService);
    const confirmSpy = spyOn(dialog, 'confirmTyped').and.resolveTo(false);

    await component.remove();
    expect(deleteOrganization).not.toHaveBeenCalled();

    confirmSpy.and.resolveTo(true);
    await component.remove();

    expect(confirmSpy).toHaveBeenCalledWith(
      'Delete organization?',
      jasmine.any(String),
      'Northwind Labs',
      'Delete organization',
    );
    expect(deleteOrganization).toHaveBeenCalledWith(2);
  });

  it('disables the form for a non-owner', () => {
    render(99);

    expect(component.isOwner()).toBeFalse();
    expect(component.form.disabled).toBeTrue();
  });
});
