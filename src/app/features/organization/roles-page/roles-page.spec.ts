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
import { DialogService } from '@core/services/dialog.service';
import { OrganizationRepository } from '../organization.repository';
import { OrganizationRole, OrganizationStatus } from '../organization.models';
import { RolesPage } from './roles-page';

const ROLES: OrganizationRole[] = [
  { id: 1, organizationId: 2, name: 'Manager', description: 'Runs the team' },
  { id: 2, organizationId: 2, name: 'Contributor', description: null },
];

const createRole = jasmine.createSpy('createRole').and.returnValue(of(1));
const updateRole = jasmine.createSpy('updateRole').and.returnValue(of(void 0));
const deleteRole = jasmine.createSpy('deleteRole').and.returnValue(of(void 0));

/** Stubs every call `OrganizationFacade.init()` fans out to, so the page gets real signal data. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () => of([]),
  getTasks: () => of([]),
  getRoles: () => of(ROLES),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
  createRole,
  updateRole,
  deleteRole,
};

describe('RolesPage', () => {
  let component: RolesPage;
  let fixture: ComponentFixture<RolesPage>;

  beforeEach(async () => {
    createRole.calls.reset();
    updateRole.calls.reset();
    deleteRole.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RolesPage],
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

    fixture = TestBed.createComponent(RolesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the org roles', () => {
    expect(component.roles().length).toBe(2);
    expect(component.hasRoles()).toBeTrue();
  });

  it('opens the drawer in edit mode pre-filled, and normalises a null description', () => {
    component.openEdit(ROLES[1]);

    expect(component.isEditing()).toBeTrue();
    expect(component.createForm.getRawValue()).toEqual({ name: 'Contributor', description: '' });
  });

  it('submits an update while editing and a create otherwise', () => {
    component.openEdit(ROLES[0]);
    component.createForm.controls.description.setValue('Runs the team day to day');
    component.submit();

    expect(updateRole).toHaveBeenCalledWith({
      roleId: 1,
      name: 'Manager',
      description: 'Runs the team day to day',
    });
    expect(createRole).not.toHaveBeenCalled();

    component.openCreate();
    component.createForm.controls.name.setValue('Viewer');
    component.submit();

    expect(createRole).toHaveBeenCalledWith(2, 'Viewer', '');
  });

  it('deletes only after the confirm dialog resolves true', async () => {
    const dialog = TestBed.inject(DialogService);
    const confirmSpy = spyOn(dialog, 'confirmDelete').and.resolveTo(false);

    await component.remove(ROLES[0]);
    expect(deleteRole).not.toHaveBeenCalled();

    confirmSpy.and.resolveTo(true);
    await component.remove(ROLES[0]);
    expect(deleteRole).toHaveBeenCalledWith(1);
  });
});
