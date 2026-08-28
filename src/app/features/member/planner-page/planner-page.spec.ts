import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { ProjectStatus } from '../member.models';
import { MemberRepository } from '../member.repository';
import { PlannerPage } from './planner-page';
import { PlannerFacade } from './planner.facade';

const projects = [
  {
    id: 11,
    organizationId: null,
    title: 'Launch workspace',
    description: 'Plan the release.',
    status: ProjectStatus.Active,
    startDate: '2026-08-01T00:00:00Z',
    expectedCompletionDate: null,
    actualCompletionDate: null,
    createdByUserId: 7,
    taskCount: 8,
    completedTaskCount: 3,
    completionPercentage: 37.5,
  },
  {
    id: 22,
    organizationId: null,
    title: 'Personal site',
    description: null,
    status: ProjectStatus.Draft,
    startDate: '2026-08-20T00:00:00Z',
    expectedCompletionDate: null,
    actualCompletionDate: null,
    createdByUserId: 7,
    taskCount: 0,
    completedTaskCount: 0,
    completionPercentage: 0,
  },
];

let getMyPersonalProjects: jasmine.Spy;
let createPersonalProject: jasmine.Spy;
let createNote: jasmine.Spy;
let loadRequirements: jasmine.Spy;

describe('PlannerPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    getMyPersonalProjects = jasmine
      .createSpy('getMyPersonalProjects')
      .and.returnValue(of(projects));
    createPersonalProject = jasmine.createSpy('createPersonalProject').and.returnValue(of(33));
    createNote = jasmine.createSpy('createNote').and.resolveTo(null);
    loadRequirements = jasmine.createSpy('loadRequirements').and.resolveTo();

    const repositoryStub = {
      getMyPersonalProjects,
      createPersonalProject,
    };
    const plannerFacadeStub = {
      syncState: signal<'ready'>('ready'),
      syncError: signal<string | null>(null),
      conflict: signal(null),
      savedAt: signal<Date | null>(null),
      recoveryAvailable: signal(true),
      workspace: signal(null),
      nodesLoading: signal(false),
      nodeSaving: signal(false),
      nodeError: signal<string | null>(null),
      templates: signal([]),
      templatesLoading: signal(false),
      resources: signal([]),
      resourcesLoading: signal(false),
      requirementBaselines: signal([]),
      selectedBaseline: signal(null),
      requirementChanges: signal([]),
      requirementComparison: signal(null),
      requirementsLoading: signal(false),
      requirementsSaving: signal(false),
      requirementsError: signal<string | null>(null),
      openProject: jasmine.createSpy('openProject').and.resolveTo(
        '{"type":"excalidraw","version":2,"source":"taskflow","elements":[],"appState":{},"files":{}}',
      ),
      stageScene: jasmine.createSpy('stageScene'),
      reportEmbeddedFiles: jasmine.createSpy('reportEmbeddedFiles'),
      reportSceneLimit: jasmine.createSpy('reportSceneLimit'),
      flush: jasmine.createSpy('flush').and.resolveTo(),
      retry: jasmine.createSpy('retry'),
      keepLocalVersion: jasmine.createSpy('keepLocalVersion').and.resolveTo(),
      useServerVersion: jasmine.createSpy('useServerVersion').and.resolveTo(null),
      refreshWorkspace: jasmine.createSpy('refreshWorkspace').and.resolveTo(null),
      linkProject: jasmine.createSpy('linkProject').and.resolveTo(null),
      createTaskNode: jasmine.createSpy('createTaskNode').and.resolveTo(null),
      createSubTaskNode: jasmine.createSpy('createSubTaskNode').and.resolveTo(null),
      updateNode: jasmine.createSpy('updateNode').and.resolveTo(false),
      removeNode: jasmine.createSpy('removeNode').and.resolveTo(false),
      loadTemplates: jasmine.createSpy('loadTemplates').and.resolveTo(),
      loadResources: jasmine.createSpy('loadResources').and.resolveTo(),
      createNote,
      createLink: jasmine.createSpy('createLink').and.resolveTo(null),
      uploadDocument: jasmine.createSpy('uploadDocument').and.resolveTo(null),
      linkResource: jasmine.createSpy('linkResource').and.resolveTo(null),
      updateResource: jasmine.createSpy('updateResource').and.resolveTo(false),
      deleteResource: jasmine.createSpy('deleteResource').and.resolveTo(false),
      getResourceContent: jasmine.createSpy('getResourceContent').and.resolveTo(null),
      loadRequirements,
      finalizeRequirements: jasmine.createSpy('finalizeRequirements').and.resolveTo(true),
    };

    await TestBed.configureTestingModule({
      imports: [PlannerPage],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideToastr(),
        { provide: MemberRepository, useValue: repositoryStub },
        { provide: PlannerFacade, useValue: plannerFacadeStub },
      ],
    }).compileComponents();
  });

  it('loads personal projects and selects the first available project', () => {
    const component = TestBed.createComponent(PlannerPage).componentInstance;

    expect(getMyPersonalProjects).toHaveBeenCalledTimes(1);
    expect(component.selectedProject()?.id).toBe(11);
  });

  it('switches project context without mixing the selected project', async () => {
    const component = TestBed.createComponent(PlannerPage).componentInstance;

    await component.selectProject('22');

    expect(component.selectedProject()?.id).toBe(22);
  });

  it('uses the shared project validation rules in the create drawer', () => {
    const component = TestBed.createComponent(PlannerPage).componentInstance;

    component.openCreateProject();
    component.projectForm.controls.title.setValue('');
    component.projectForm.controls.title.markAsTouched();

    expect(component.projectFieldError('title')).toBe('A title is required.');
  });

  it('creates a private project through the existing personal-project endpoint', () => {
    const component = TestBed.createComponent(PlannerPage).componentInstance;
    component.openCreateProject();
    component.projectForm.controls.title.setValue('Planner delivery');

    component.createProject();

    expect(createPersonalProject).toHaveBeenCalled();
    const payload = createPersonalProject.calls.mostRecent().args[0];
    expect(payload.title).toBe('Planner delivery');
    expect(Object.keys(payload)).not.toContain('organizationId');
  });

  it('exposes a recoverable project-loading error', () => {
    getMyPersonalProjects.and.returnValue(throwError(() => new Error('offline')));
    const component = TestBed.createComponent(PlannerPage).componentInstance;

    expect(component.loadError()).toContain('Could not load your projects');

    getMyPersonalProjects.and.returnValue(of(projects));
    component.retryProjects();
    expect(component.loadError()).toBeNull();
  });

  it('creates a note through the secure Planner resource flow', async () => {
    const component = TestBed.createComponent(PlannerPage).componentInstance;
    component.openResourceCreator('note');
    component.resourceForm.patchValue({ title: 'Decision', content: 'Keep files outside scene JSON.' });

    await component.createResource();

    expect(createNote).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Decision', content: 'Keep files outside scene JSON.',
    }));
  });

  it('opens the primary-requirement history for the active project', async () => {
    const component = TestBed.createComponent(PlannerPage).componentInstance;

    await component.openRequirements();

    expect(component.showRequirements()).toBeTrue();
    expect(loadRequirements).toHaveBeenCalledWith(11, null);
  });

  it('offers an explicit cloud import while preserving embedded legacy media', () => {
    localStorage.setItem('taskflow-planner:signed-out', JSON.stringify({
      type: 'excalidraw',
      elements: [
        { id: 'shape', type: 'rectangle' },
        { id: 'image', type: 'image', fileId: 'file-1' },
      ],
      appState: {},
      files: { 'file-1': { dataURL: 'data:image/png;base64,AA' } },
    }));
    const component = TestBed.createComponent(PlannerPage).componentInstance;
    const internals = component as unknown as {
      offerLegacyScene(projectId: number): void;
      sanitizeLegacyScene(sceneJson: string): { sceneJson: string; omittedImages: number } | null;
    };

    internals.offerLegacyScene(11);
    const imported = internals.sanitizeLegacyScene(
      localStorage.getItem('taskflow-planner:signed-out')!,
    );

    expect(component.legacySceneAvailable()).toBeTrue();
    expect(component.legacyEmbeddedFileCount()).toBe(1);
    expect(imported?.omittedImages).toBe(1);
    expect(JSON.parse(imported!.sceneJson).elements.map((item: { type: string }) => item.type))
      .toEqual(['rectangle']);
    expect(localStorage.getItem('taskflow-planner:signed-out')).not.toBeNull();
  });
});
