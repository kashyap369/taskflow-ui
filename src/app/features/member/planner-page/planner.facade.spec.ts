import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { PlannerBoard, PlannerWorkspace } from './planner.models';
import { PlannerRecoveryStore } from './planner-recovery.store';
import { PlannerRepository } from './planner.repository';
import { PlannerFacade } from './planner.facade';

const emptyScene =
  '{"type":"excalidraw","version":2,"source":"taskflow","elements":[],"appState":{},"files":{}}';

const board = (revision: number): PlannerBoard => ({
  boardId: 'a9290f65-8484-4e68-b56d-e23301250731',
  projectId: 11,
  revision,
  sceneJson: emptyScene,
  updatedAt: '2026-08-28T00:00:00Z',
  lastOpenedAt: null,
});

const workspace: PlannerWorkspace = {
  boardId: board(0).boardId,
  projectId: 11,
  project: {
    title: 'Launch workspace', description: null, problemStatement: null, budgetAmount: null,
    budgetCurrency: null, approximateDurationWeeks: null, status: 2,
    startDate: '2026-08-28T00:00:00Z', expectedCompletionDate: null,
    actualCompletionDate: null, totalTaskCount: 0, completedTaskCount: 0,
    totalSubTaskCount: 0, completedSubTaskCount: 0, completionPercentage: 0,
  },
  nodes: [],
};

describe('PlannerFacade', () => {
  let repository: jasmine.SpyObj<PlannerRepository>;
  let recovery: jasmine.SpyObj<PlannerRecoveryStore>;

  beforeEach(() => {
    repository = jasmine.createSpyObj<PlannerRepository>('PlannerRepository', [
      'getBoard',
      'saveScene',
      'getWorkspace',
      'linkProject',
      'createTaskNode',
      'createSubTaskNode',
      'updateNode',
      'removeNode',
      'getTemplates',
      'getResources', 'createNote', 'createLink', 'uploadDocument', 'linkResource',
      'updateResource', 'deleteResource', 'getResourceContent',
      'getRequirementBaselines', 'getRequirementBaseline', 'getRequirementChanges',
      'compareRequirements', 'finalizeRequirements',
    ]);
    recovery = jasmine.createSpyObj<PlannerRecoveryStore>('PlannerRecoveryStore', [
      'isAvailable',
      'read',
      'write',
    ]);
    recovery.isAvailable.and.resolveTo(true);
    recovery.read.and.resolveTo(null);
    recovery.write.and.resolveTo(true);
    repository.getBoard.and.returnValue(of(board(0)));
    repository.getWorkspace.and.returnValue(of(workspace));
    repository.getResources.and.returnValue(of([]));
    repository.getRequirementBaselines.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        PlannerFacade,
        { provide: PlannerRepository, useValue: repository },
        { provide: PlannerRecoveryStore, useValue: recovery },
        { provide: AuthService, useValue: { user: signal({ id: 7 }) } },
      ],
    });
  });

  it('loads the authoritative cloud scene and caches it for recovery', async () => {
    const facade = TestBed.inject(PlannerFacade);

    const scene = await facade.openProject(11);

    expect(scene).toBe(emptyScene);
    expect(facade.syncState()).toBe('ready');
    expect(recovery.write).toHaveBeenCalledWith(
      jasmine.objectContaining({ projectId: 11, baseRevision: 0, pending: false }),
    );
  });

  it('saves a staged scene with the current revision', async () => {
    repository.saveScene.and.returnValue(
      of({
        boardId: board(0).boardId,
        revision: 1,
        savedAt: '2026-08-28T00:01:00Z',
      }),
    );
    const facade = TestBed.inject(PlannerFacade);
    await facade.openProject(11);

    facade.stageScene(emptyScene);
    await facade.flush();

    expect(repository.saveScene).toHaveBeenCalledWith(11, {
      expectedRevision: 0,
      sceneJson: emptyScene,
    });
    expect(facade.syncState()).toBe('saved');
  });

  it('preserves local work and exposes a conflict when the cloud revision is newer', async () => {
    repository.getBoard.and.returnValues(of(board(0)), of(board(2)));
    repository.saveScene.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    const facade = TestBed.inject(PlannerFacade);
    await facade.openProject(11);

    facade.stageScene(emptyScene);
    await facade.flush();

    expect(facade.syncState()).toBe('conflict');
    expect(facade.conflict()?.remote.revision).toBe(2);
    expect(facade.conflict()?.localSceneJson).toBe(emptyScene);
  });

  it('opens the IndexedDB recovery copy when the API is unavailable', async () => {
    repository.getBoard.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );
    recovery.read.and.resolveTo({
      key: '7:11',
      projectId: 11,
      baseRevision: 3,
      sceneJson: emptyScene,
      pending: true,
      savedAt: '2026-08-28T00:00:00Z',
    });
    const facade = TestBed.inject(PlannerFacade);

    const scene = await facade.openProject(11);

    expect(scene).toBe(emptyScene);
    expect(facade.syncState()).toBe('offline');
    expect(facade.syncError()).toContain('recovery copy');
  });

  it('keeps cloud loading available when IndexedDB is unavailable', async () => {
    recovery.isAvailable.and.resolveTo(false);
    const facade = TestBed.inject(PlannerFacade);

    const scene = await facade.openProject(11);

    expect(scene).toBe(emptyScene);
    expect(facade.syncState()).toBe('ready');
    expect(facade.recoveryAvailable()).toBeFalse();
    expect(recovery.read).not.toHaveBeenCalled();
  });

  it('does not claim offline changes are safe when recovery is unavailable', async () => {
    recovery.isAvailable.and.resolveTo(false);
    repository.saveScene.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );
    const facade = TestBed.inject(PlannerFacade);
    await facade.openProject(11);

    facade.stageScene(emptyScene);
    await facade.flush();

    expect(facade.syncState()).toBe('error');
    expect(facade.syncError()).toContain('recovery is unavailable');
  });

  it('blocks sync when the canvas exceeds the measured production element limit', () => {
    const facade = TestBed.inject(PlannerFacade);

    facade.reportSceneLimit();

    expect(facade.syncState()).toBe('error');
    expect(facade.syncError()).toContain('5,000-element');
  });

  it('creates a canonical task node once and refreshes backend-derived workspace state', async () => {
    repository.createTaskNode.and.returnValue(of('node-1'));
    repository.getWorkspace.and.returnValues(
      of(workspace),
      of({ ...workspace, nodes: [{
        nodeId: 'node-1', elementId: 'element-1', nodeType: 2, entityId: 41,
        parentEntityId: 11, title: 'Release', description: '', status: 1, priority: 2,
        startDate: '2026-08-28T00:00:00Z', expectedCompletionDate: null,
        actualCompletionDate: null, childCount: 0, completedChildCount: 0,
        completionPercentage: 0, problemStatement: null, budgetAmount: null,
        budgetCurrency: null, approximateDurationWeeks: null,
        templateVersion: null,
      }] }),
    );
    const facade = TestBed.inject(PlannerFacade);
    await facade.openProject(11);

    const nodeId = await facade.createTaskNode({
      elementId: 'element-1', title: 'Release', description: '',
      startDate: '2026-08-28T00:00:00Z', priority: 2, expectedCompletionDate: null,
    });

    expect(nodeId).toBe('node-1');
    expect(repository.createTaskNode).toHaveBeenCalledTimes(1);
    expect(facade.workspace()?.nodes[0].entityId).toBe(41);
  });

  it('creates a note resource and refreshes resource state', async () => {
    repository.createNote.and.returnValue(of('note-node'));
    const facade = TestBed.inject(PlannerFacade);
    await facade.openProject(11);
    const nodeId = await facade.createNote({ elementId: 'note-element', title: 'Decision', content: 'Ship it.' });
    expect(nodeId).toBe('note-node');
    expect(repository.getResources).toHaveBeenCalledWith(11);
  });

  it('finalizes an immutable baseline and loads its comparison state', async () => {
    const baseline = {
      id: 'baseline-1', projectId: 11, baselineNumber: 1, snapshotCount: 1,
      finalizedByUserId: 7, finalizedAt: '2026-08-28T00:00:00Z', snapshots: [],
    };
    repository.finalizeRequirements.and.returnValue(of(baseline));
    repository.getRequirementBaselines.and.returnValues(of([]), of([baseline]));
    repository.getRequirementBaseline.and.returnValue(of(baseline));
    repository.getRequirementChanges.and.returnValue(of([]));
    repository.compareRequirements.and.returnValue(of({
      baselineId: baseline.id, baselineNumber: 1, finalizedAt: baseline.finalizedAt, items: [],
    }));
    const facade = TestBed.inject(PlannerFacade);
    await facade.openProject(11);

    expect(await facade.finalizeRequirements()).toBeTrue();
    expect(facade.requirementBaselines().length).toBe(1);
    expect(facade.selectedBaseline()?.id).toBe('baseline-1');
  });
});
