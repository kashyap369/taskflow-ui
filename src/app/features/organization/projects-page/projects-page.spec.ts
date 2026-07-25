import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { APP_SETTINGS } from '@core/config/app.tokens';
import { AppSettings } from '@core/config/app.settings';
import { DialogService } from '@core/services/dialog.service';
import { OrganizationRepository } from '../organization.repository';
import { OrganizationStatus, Project, ProjectStatus } from '../organization.models';
import { ProjectsPage } from './projects-page';

const project = (id: number, title: string, status: ProjectStatus, description = ''): Project => ({
  id,
  organizationId: 2,
  title,
  description,
  status,
  startDate: '2026-07-01T00:00:00Z',
  expectedCompletionDate: null,
  actualCompletionDate: null,
  createdByUserId: 1,
  taskCount: 0,
  completedTaskCount: 0,
  completionPercentage: 0,
});

const PROJECTS: Project[] = [
  project(1, 'Website Redesign', ProjectStatus.Active, 'Marketing site refresh'),
  project(2, 'Mobile App', ProjectStatus.Completed),
  ...Array.from({ length: 10 }, (_, i) =>
    project(100 + i, `Filler project ${i + 1}`, ProjectStatus.Draft),
  ),
];

const updateProject = jasmine.createSpy('updateProject').and.returnValue(of(void 0));
const deleteProject = jasmine.createSpy('deleteProject').and.returnValue(of(void 0));

/** Stubs every call `OrganizationFacade.init()` fans out to, so the page gets real signal data. */
const repositoryStub = {
  getMyOrganizations: () =>
    of([{ id: 2, name: 'Northwind Labs', ownerUserId: 1, status: OrganizationStatus.Active }]),
  getDashboard: () => of(null),
  getProjects: () => of(PROJECTS),
  getTasks: () => of([]),
  getRoles: () => of([]),
  getMembers: () => of([]),
  getInvitations: () => of([]),
  getTeams: () => of([]),
  getPermissionCatalog: () => of([]),
  updateProject,
  deleteProject,
};

describe('ProjectsPage', () => {
  let component: ProjectsPage;
  let fixture: ComponentFixture<ProjectsPage>;

  beforeEach(async () => {
    updateProject.calls.reset();
    deleteProject.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ProjectsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideAnimations(),
        { provide: APP_SETTINGS, useValue: AppSettings },
        { provide: OrganizationRepository, useValue: repositoryStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('searches the title and the description', () => {
    component.onSearch('mobile');
    expect(component.filteredProjects().length).toBe(1);

    component.onSearch('marketing site');
    expect(component.filteredProjects()[0].title).toBe('Website Redesign');
  });

  it('filters by status', () => {
    component.onStatusFilter(String(ProjectStatus.Completed));
    expect(component.filteredProjects().length).toBe(1);
    expect(component.filteredProjects()[0].title).toBe('Mobile App');
  });

  it('pages the card grid nine at a time', () => {
    expect(component.pager.total()).toBe(12);
    expect(component.pager.pageSize()).toBe(9);
    expect(component.pager.items().length).toBe(9);

    component.pager.setPage(2);
    expect(component.pager.items().length).toBe(3);
  });

  it('clears the filters', () => {
    component.onSearch('mobile');
    component.onStatusFilter(String(ProjectStatus.Completed));

    component.clearFilters();

    expect(component.filteredProjects().length).toBe(12);
  });

  // ── Edit / delete ──

  it('opens the drawer in create mode with an empty form', () => {
    component.openCreate();

    expect(component.showDrawer()).toBeTrue();
    expect(component.isEditing()).toBeFalse();
    expect(component.createForm.getRawValue().title).toBe('');
  });

  it('opens the drawer in edit mode pre-filled from the row', () => {
    component.openEdit(PROJECTS[0]);

    expect(component.isEditing()).toBeTrue();
    const value = component.createForm.getRawValue();
    expect(value.title).toBe('Website Redesign');
    expect(value.description).toBe('Marketing site refresh');
    expect(value.startDate).toBe('2026-07-01');
  });

  it('submits an update (not a create) while editing, without the start date', () => {
    component.openEdit(PROJECTS[0]);
    component.createForm.controls.title.setValue('Website Redesign v2');
    component.submit();

    expect(updateProject).toHaveBeenCalledWith({
      projectId: 1,
      title: 'Website Redesign v2',
      description: 'Marketing site refresh',
      expectedCompletionDate: null,
    });
    expect(component.showDrawer()).toBeFalse();
    expect(component.isEditing()).toBeFalse();
  });

  it('does not submit an invalid edit', () => {
    component.openEdit(PROJECTS[0]);
    component.createForm.controls.title.setValue('');
    component.submit();

    expect(updateProject).not.toHaveBeenCalled();
    expect(component.showDrawer()).toBeTrue();
  });

  it('deletes only after the confirm dialog resolves true', async () => {
    const dialog = TestBed.inject(DialogService);
    const confirmSpy = spyOn(dialog, 'confirmDelete').and.resolveTo(false);

    await component.remove(PROJECTS[0]);
    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteProject).not.toHaveBeenCalled();

    confirmSpy.and.resolveTo(true);
    await component.remove(PROJECTS[0]);
    expect(deleteProject).toHaveBeenCalledWith(1);
  });
});
