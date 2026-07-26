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
import { OrganizationStatus, Team } from '../organization.models';
import { TeamsPage } from './teams-page';

const TEAMS: Team[] = [
  { id: 2, organizationId: 2, name: 'Engineering', description: 'Builds the product', memberCount: 1 },
  { id: 3, organizationId: 2, name: 'Design', description: null, memberCount: 0 },
];

const createTeam = jasmine.createSpy('createTeam').and.returnValue(of(1));
const updateTeam = jasmine.createSpy('updateTeam').and.returnValue(of(void 0));
const deleteTeam = jasmine.createSpy('deleteTeam').and.returnValue(of(void 0));

/** Stubs every call `OrganizationFacade.init()` fans out to, so the page gets real signal data. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () => of([]),
  getTasks: () => of([]),
  getRoles: () => of([]),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of(TEAMS),
  getPermissionCatalog: () => of([]),
  createTeam,
  updateTeam,
  deleteTeam,
};

describe('TeamsPage', () => {
  let component: TeamsPage;
  let fixture: ComponentFixture<TeamsPage>;

  beforeEach(async () => {
    createTeam.calls.reset();
    updateTeam.calls.reset();
    deleteTeam.calls.reset();

    await TestBed.configureTestingModule({
      imports: [TeamsPage],
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

    fixture = TestBed.createComponent(TeamsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the drawer in edit mode pre-filled, and normalises a null description', () => {
    component.openEdit(TEAMS[1]);

    expect(component.isEditing()).toBeTrue();
    expect(component.createForm.getRawValue()).toEqual({ name: 'Design', description: '' });
  });

  it('submits an update while editing and a create otherwise', () => {
    component.openEdit(TEAMS[0]);
    component.createForm.controls.name.setValue('Platform');
    component.submit();

    expect(updateTeam).toHaveBeenCalledWith({
      teamId: 2,
      name: 'Platform',
      description: 'Builds the product',
    });
    expect(createTeam).not.toHaveBeenCalled();

    component.openCreate();
    component.createForm.controls.name.setValue('QA');
    component.submit();

    expect(createTeam).toHaveBeenCalledWith(2, 'QA', '');
  });

  it('closing the drawer leaves edit mode', () => {
    component.openEdit(TEAMS[0]);
    component.closeDrawer();

    expect(component.showDrawer()).toBeFalse();
    expect(component.isEditing()).toBeFalse();
  });

  it('filters teams by name or description, and pages the result', () => {
    expect(component.pager.total()).toBe(2);

    component.onSearch('design');
    expect(component.filteredTeams().map((t) => t.id)).toEqual([3]);

    // The description is searched too.
    component.onSearch('builds the product');
    expect(component.filteredTeams().map((t) => t.id)).toEqual([2]);

    component.clearFilters();
    expect(component.pager.total()).toBe(2);
  });

  it('reports a validation message from the decorated model, not an inline Validator', () => {
    component.openCreate();
    component.createForm.controls.name.markAsTouched();

    expect(component.fieldError('name')).toBe('A team name is required.');

    component.createForm.controls.name.setValue('Platform');
    expect(component.fieldError('name')).toBeNull();
  });

  it('deletes only after the confirm dialog resolves true', async () => {
    const dialog = TestBed.inject(DialogService);
    const confirmSpy = spyOn(dialog, 'confirmDelete').and.resolveTo(false);

    await component.remove(TEAMS[0]);
    expect(deleteTeam).not.toHaveBeenCalled();

    confirmSpy.and.resolveTo(true);
    await component.remove(TEAMS[0]);
    expect(deleteTeam).toHaveBeenCalledWith(2);
  });
});
