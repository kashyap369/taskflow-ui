import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import {
  CreatePlannerSubTaskNodePayload,
  CreatePlannerTaskNodePayload,
  PlannerConflict,
  PlannerSyncState,
  PlannerWorkspace,
  UpdatePlannerNodePayload,
  PlannerResource,
  CreatePlannerNotePayload,
  CreatePlannerLinkPayload,
  UpdatePlannerResourcePayload,
  RequirementBaseline,
  RequirementBaselineListItem,
  RequirementChange,
  RequirementChangeType,
  RequirementComparison,
} from './planner.models';
import { PlannerRecoveryRecord, PlannerRecoveryStore } from './planner-recovery.store';
import { PlannerRepository } from './planner.repository';
import { PlannerTemplate } from '@core/models/planner-template.model';

@Injectable({ providedIn: 'root' })
export class PlannerFacade {
  private readonly repository = inject(PlannerRepository);
  private readonly recoveryStore = inject(PlannerRecoveryStore);
  private readonly auth = inject(AuthService);
  private activeProjectId: number | null = null;
  private currentRevision = 0;
  private pendingSceneJson: string | null = null;
  private saveTimer: number | null = null;
  private savePromise: Promise<void> | null = null;
  private recoveryWriteChain: Promise<void> = Promise.resolve();
  private openGeneration = 0;

  private readonly _syncState = signal<PlannerSyncState>('ready');
  private readonly _syncError = signal<string | null>(null);
  private readonly _conflict = signal<PlannerConflict | null>(null);
  private readonly _savedAt = signal<Date | null>(null);
  private readonly _recoveryAvailable = signal(true);
  private readonly _workspace = signal<PlannerWorkspace | null>(null);
  private readonly _nodesLoading = signal(false);
  private readonly _nodeSaving = signal(false);
  private readonly _nodeError = signal<string | null>(null);
  private readonly _templates = signal<PlannerTemplate[]>([]);
  private readonly _templatesLoading = signal(false);
  private readonly _resources = signal<PlannerResource[]>([]);
  private readonly _resourcesLoading = signal(false);
  private readonly _requirementBaselines = signal<RequirementBaselineListItem[]>([]);
  private readonly _selectedBaseline = signal<RequirementBaseline | null>(null);
  private readonly _requirementChanges = signal<RequirementChange[]>([]);
  private readonly _requirementComparison = signal<RequirementComparison | null>(null);
  private readonly _requirementsLoading = signal(false);
  private readonly _requirementsSaving = signal(false);
  private readonly _requirementsError = signal<string | null>(null);

  readonly syncState = this._syncState.asReadonly();
  readonly syncError = this._syncError.asReadonly();
  readonly conflict = this._conflict.asReadonly();
  readonly savedAt = this._savedAt.asReadonly();
  readonly recoveryAvailable = this._recoveryAvailable.asReadonly();
  readonly workspace = this._workspace.asReadonly();
  readonly nodesLoading = this._nodesLoading.asReadonly();
  readonly nodeSaving = this._nodeSaving.asReadonly();
  readonly nodeError = this._nodeError.asReadonly();
  readonly templates = this._templates.asReadonly();
  readonly templatesLoading = this._templatesLoading.asReadonly();
  readonly resources = this._resources.asReadonly();
  readonly resourcesLoading = this._resourcesLoading.asReadonly();
  readonly requirementBaselines = this._requirementBaselines.asReadonly();
  readonly selectedBaseline = this._selectedBaseline.asReadonly();
  readonly requirementChanges = this._requirementChanges.asReadonly();
  readonly requirementComparison = this._requirementComparison.asReadonly();
  readonly requirementsLoading = this._requirementsLoading.asReadonly();
  readonly requirementsSaving = this._requirementsSaving.asReadonly();
  readonly requirementsError = this._requirementsError.asReadonly();

  constructor() {
    window.addEventListener('online', () => {
      if (this.pendingSceneJson && !this._conflict()) {
        void this.saveNow();
      }
    });
  }

  async openProject(projectId: number): Promise<string> {
    await this.flush();
    this.clearTimer();

    const generation = ++this.openGeneration;
    this.activeProjectId = projectId;
    this.currentRevision = 0;
    this.pendingSceneJson = null;
    this._syncState.set('loading');
    this._syncError.set(null);
    this._conflict.set(null);
    this._savedAt.set(null);
    this._workspace.set(null);
    this._resources.set([]);
    this._requirementBaselines.set([]);
    this._selectedBaseline.set(null);
    this._requirementChanges.set([]);
    this._requirementComparison.set(null);
    void this.refreshWorkspace(projectId);
    void this.loadRequirements(projectId);

    const key = this.recoveryKey(projectId);
    const recoveryAvailable = await this.checkRecoveryAvailability();
    const cached = recoveryAvailable ? await this.readRecovery(key) : null;

    try {
      const board = await firstValueFrom(this.repository.getBoard(projectId));
      if (generation !== this.openGeneration) {
        return board.sceneJson;
      }

      this.currentRevision = board.revision;
      this._savedAt.set(new Date(board.updatedAt));

      if (cached?.pending) {
        this.pendingSceneJson = cached.sceneJson;
        if (cached.baseRevision === board.revision) {
          this._syncState.set('saving');
          this.scheduleSave(0);
        } else {
          this._conflict.set({ localSceneJson: cached.sceneJson, remote: board });
          this._syncState.set('conflict');
        }
        return cached.sceneJson;
      }

      await this.cacheScene(board.sceneJson, board.revision, false);
      this._syncState.set('ready');
      return board.sceneJson;
    } catch {
      if (generation !== this.openGeneration) {
        return cached?.sceneJson ?? this.emptyScene();
      }

      if (cached) {
        this.currentRevision = cached.baseRevision;
        this.pendingSceneJson = cached.pending ? cached.sceneJson : null;
        this._syncState.set('offline');
        this._syncError.set('The cloud board is unavailable. Your recovery copy is open.');
        return cached.sceneJson;
      }

      this._syncState.set('error');
      this._syncError.set('The Planner board could not be loaded. Check your connection and retry.');
      return this.emptyScene();
    }
  }

  stageScene(sceneJson: string): void {
    if (this.activeProjectId === null) {
      return;
    }

    this.pendingSceneJson = sceneJson;
    const conflict = this._conflict();
    if (conflict) {
      this._conflict.set({ ...conflict, localSceneJson: sceneJson });
    } else {
      const isOnline = navigator.onLine;
      const canRecover = this._recoveryAvailable();
      this._syncState.set(isOnline ? 'saving' : canRecover ? 'offline' : 'error');
      this._syncError.set(
        isOnline
          ? null
          : canRecover
            ? 'You are offline. Changes are safe on this device and will retry.'
            : 'You are offline and browser recovery is unavailable. Keep this tab open and retry.',
      );
      if (isOnline) {
        this.scheduleSave(800);
      }
    }

    void this.cacheScene(sceneJson, this.currentRevision, true);
  }

  reportEmbeddedFiles(): void {
    this._syncState.set('error');
    this._syncError.set('Embedded canvas files cannot be synced. Remove the image, then upload it with Add resource.');
  }

  reportSceneLimit(): void {
    this._syncState.set('error');
    this._syncError.set('This board exceeds the 5,000-element production limit. Remove unused elements before syncing.');
  }

  async refreshWorkspace(projectId = this.activeProjectId): Promise<PlannerWorkspace | null> {
    if (projectId === null) {
      return null;
    }
    this._nodesLoading.set(true);
    this._nodeError.set(null);
    try {
      const workspace = await firstValueFrom(this.repository.getWorkspace(projectId));
      if (this.activeProjectId === projectId) {
        this._workspace.set(workspace);
      }
      return workspace;
    } catch {
      if (this.activeProjectId === projectId) {
        this._nodeError.set('Linked work items could not be refreshed. Your canvas is still available.');
      }
      return null;
    } finally {
      if (this.activeProjectId === projectId) {
        this._nodesLoading.set(false);
      }
    }
  }

  async loadTemplates(): Promise<void> {
    this._templatesLoading.set(true);
    try { this._templates.set(await firstValueFrom(this.repository.getTemplates())); }
    finally { this._templatesLoading.set(false); }
  }

  async loadResources(projectId = this.activeProjectId): Promise<void> {
    if (projectId === null) return;
    this._resourcesLoading.set(true);
    try {
      const resources = await firstValueFrom(this.repository.getResources(projectId));
      if (this.activeProjectId === projectId) this._resources.set(resources);
    } catch {
      if (this.activeProjectId === projectId) this._nodeError.set('Planner resources could not be loaded.');
    } finally {
      if (this.activeProjectId === projectId) this._resourcesLoading.set(false);
    }
  }

  async loadRequirements(projectId = this.activeProjectId,
    changeType?: RequirementChangeType | null): Promise<void> {
    if (projectId === null) return;
    this._requirementsLoading.set(true);
    this._requirementsError.set(null);
    try {
      const baselines = await firstValueFrom(this.repository.getRequirementBaselines(projectId));
      if (this.activeProjectId !== projectId) return;
      this._requirementBaselines.set(baselines);
      if (!baselines.length) {
        this._selectedBaseline.set(null);
        this._requirementChanges.set([]);
        this._requirementComparison.set(null);
        return;
      }
      const baselineId = baselines[0].id;
      const [baseline, changes, comparison] = await Promise.all([
        firstValueFrom(this.repository.getRequirementBaseline(projectId, baselineId)),
        firstValueFrom(this.repository.getRequirementChanges(projectId, changeType)),
        firstValueFrom(this.repository.compareRequirements(projectId, baselineId, changeType)),
      ]);
      if (this.activeProjectId === projectId) {
        this._selectedBaseline.set(baseline);
        this._requirementChanges.set(changes);
        this._requirementComparison.set(comparison);
      }
    } catch {
      if (this.activeProjectId === projectId)
        this._requirementsError.set('Requirement history could not be loaded. Check your connection and retry.');
    } finally {
      if (this.activeProjectId === projectId) this._requirementsLoading.set(false);
    }
  }

  async finalizeRequirements(): Promise<boolean> {
    const projectId = this.activeProjectId;
    if (projectId === null || this._requirementsSaving()) return false;
    this._requirementsSaving.set(true);
    this._requirementsError.set(null);
    try {
      await firstValueFrom(this.repository.finalizeRequirements(projectId));
      await this.loadRequirements(projectId);
      return true;
    } catch (error) {
      const response = error as HttpErrorResponse;
      this._requirementsError.set(
        typeof response.error?.message === 'string'
          ? response.error.message
          : 'Primary requirements could not be finalized. Try again.',
      );
      return false;
    } finally {
      this._requirementsSaving.set(false);
    }
  }

  linkProject(elementId: string, templateVersionId?: string | null): Promise<string | null> {
    return this.runNodeMutation((projectId) => this.repository.linkProject(projectId, elementId, templateVersionId));
  }

  createTaskNode(payload: CreatePlannerTaskNodePayload): Promise<string | null> {
    return this.runNodeMutation((projectId) => this.repository.createTaskNode(projectId, payload));
  }

  createSubTaskNode(payload: CreatePlannerSubTaskNodePayload): Promise<string | null> {
    return this.runNodeMutation((projectId) => this.repository.createSubTaskNode(projectId, payload));
  }

  createNote(payload: CreatePlannerNotePayload): Promise<string | null> {
    return this.runResourceMutation((projectId) => this.repository.createNote(projectId, payload));
  }

  createLink(payload: CreatePlannerLinkPayload): Promise<string | null> {
    return this.runResourceMutation((projectId) => this.repository.createLink(projectId, payload));
  }

  uploadDocument(elementId: string, title: string, file: File,
    templateVersionId?: string | null): Promise<string | null> {
    return this.runResourceMutation((projectId) =>
      this.repository.uploadDocument(projectId, elementId, title, file, templateVersionId));
  }

  linkResource(resourceId: string, elementId: string,
    templateVersionId?: string | null): Promise<string | null> {
    return this.runResourceMutation((projectId) =>
      this.repository.linkResource(projectId, resourceId, elementId, templateVersionId));
  }

  async updateResource(resourceId: string, payload: UpdatePlannerResourcePayload): Promise<boolean> {
    return (await this.runResourceMutation((projectId) =>
      this.repository.updateResource(projectId, resourceId, payload))) !== null;
  }

  async deleteResource(resourceId: string): Promise<boolean> {
    return (await this.runResourceMutation((projectId) =>
      this.repository.deleteResource(projectId, resourceId))) !== null;
  }

  async getResourceContent(resourceId: string, download = false): Promise<Blob | null> {
    if (this.activeProjectId === null) return null;
    try { return await firstValueFrom(this.repository.getResourceContent(this.activeProjectId, resourceId, download)); }
    catch { this._nodeError.set('The file could not be opened. Check your connection and try again.'); return null; }
  }

  async updateNode(nodeId: string, payload: UpdatePlannerNodePayload): Promise<boolean> {
    const result = await this.runNodeMutation((projectId) =>
      this.repository.updateNode(projectId, nodeId, payload),
    );
    return result !== null;
  }

  async removeNode(nodeId: string, deleteEntity: boolean, changeReason?: string | null): Promise<boolean> {
    const result = await this.runNodeMutation((projectId) =>
      this.repository.removeNode(projectId, nodeId, deleteEntity, changeReason),
    );
    return result !== null;
  }

  async flush(): Promise<void> {
    this.clearTimer();
    if (this.savePromise) {
      await this.savePromise;
    }
    if (this.pendingSceneJson && !this._conflict()) {
      await this.saveNow();
    }
  }

  retry(): void {
    if (!this._conflict()) {
      void this.saveNow();
    }
  }

  async keepLocalVersion(): Promise<void> {
    const conflict = this._conflict();
    if (!conflict || this.activeProjectId === null) {
      return;
    }

    this.currentRevision = conflict.remote.revision;
    this.pendingSceneJson = conflict.localSceneJson;
    this._conflict.set(null);
    this._syncState.set('saving');
    await this.cacheScene(conflict.localSceneJson, this.currentRevision, true);
    await this.saveNow();
  }

  async useServerVersion(): Promise<string | null> {
    const conflict = this._conflict();
    if (!conflict) {
      return null;
    }

    this.currentRevision = conflict.remote.revision;
    this.pendingSceneJson = null;
    this._conflict.set(null);
    this._syncError.set(null);
    this._savedAt.set(new Date(conflict.remote.updatedAt));
    this._syncState.set('saved');
    await this.cacheScene(conflict.remote.sceneJson, conflict.remote.revision, false);
    return conflict.remote.sceneJson;
  }

  private scheduleSave(delay: number): void {
    this.clearTimer();
    this.saveTimer = window.setTimeout(() => void this.saveNow(), delay);
  }

  private async saveNow(): Promise<void> {
    if (this.savePromise) {
      return this.savePromise;
    }
    if (this.activeProjectId === null || !this.pendingSceneJson || this._conflict()) {
      return;
    }

    const projectId = this.activeProjectId;
    const sceneJson = this.pendingSceneJson;
    const expectedRevision = this.currentRevision;
    this.clearTimer();
    this._syncState.set('saving');
    this._syncError.set(null);

    this.savePromise = (async () => {
      try {
        const result = await firstValueFrom(
          this.repository.saveScene(projectId, { expectedRevision, sceneJson }),
        );

        if (this.activeProjectId !== projectId) {
          return;
        }

        this.currentRevision = result.revision;
        this._savedAt.set(new Date(result.savedAt));

        if (this.pendingSceneJson === sceneJson) {
          this.pendingSceneJson = null;
          this._syncState.set('saved');
          await this.cacheScene(sceneJson, result.revision, false);
        } else {
          const nextSceneJson = this.pendingSceneJson;
          if (nextSceneJson) {
            await this.cacheScene(nextSceneJson, result.revision, true);
          }
          this.scheduleSave(0);
        }
      } catch (error) {
        if (this.activeProjectId !== projectId) {
          return;
        }

        const httpError = error as HttpErrorResponse;
        if (httpError.status === 409) {
          await this.captureConflict(projectId, sceneJson);
        } else if (httpError.status === 0 || !navigator.onLine) {
          const canRecover = this._recoveryAvailable();
          this._syncState.set(canRecover ? 'offline' : 'error');
          this._syncError.set(
            canRecover
              ? 'You are offline. Changes are safe on this device and will retry.'
              : 'Cloud save failed and browser recovery is unavailable. Keep this tab open and retry.',
          );
        } else {
          this._syncState.set('error');
          this._syncError.set(
            this._recoveryAvailable()
              ? 'Cloud save failed. Your recovery copy is safe; retry when ready.'
              : 'Cloud save failed and browser recovery is unavailable. Keep this tab open and retry.',
          );
        }
      } finally {
        this.savePromise = null;
      }
    })();

    await this.savePromise;
  }

  private async captureConflict(projectId: number, localSceneJson: string): Promise<void> {
    try {
      const remote = await firstValueFrom(this.repository.getBoard(projectId));
      this._conflict.set({ localSceneJson, remote });
      this._syncState.set('conflict');
      this._syncError.set('A newer cloud version exists. Choose which version should continue.');
    } catch {
      this._syncState.set('offline');
      this._syncError.set('The latest cloud version could not be loaded. Your recovery copy is safe.');
    }
  }

  private cacheScene(sceneJson: string, baseRevision: number, pending: boolean): Promise<void> {
    if (this.activeProjectId === null || !this._recoveryAvailable()) {
      return Promise.resolve();
    }

    const record: PlannerRecoveryRecord = {
      key: this.recoveryKey(this.activeProjectId),
      projectId: this.activeProjectId,
      baseRevision,
      sceneJson,
      pending,
      savedAt: new Date().toISOString(),
    };
    this.recoveryWriteChain = this.recoveryWriteChain
      .then(async () => {
        const written = await this.recoveryStore.write(record);
        if (!written) {
          this.markRecoveryUnavailable();
        }
      })
      .catch(() => this.markRecoveryUnavailable());
    return this.recoveryWriteChain;
  }

  private async checkRecoveryAvailability(): Promise<boolean> {
    try {
      const available = await this.recoveryStore.isAvailable();
      this._recoveryAvailable.set(available);
      return available;
    } catch {
      this._recoveryAvailable.set(false);
      return false;
    }
  }

  private async readRecovery(key: string): Promise<PlannerRecoveryRecord | null> {
    try {
      return await this.recoveryStore.read(key);
    } catch {
      this._recoveryAvailable.set(false);
      return null;
    }
  }

  private markRecoveryUnavailable(): void {
    this._recoveryAvailable.set(false);
    if (this.pendingSceneJson && this._syncState() !== 'saving') {
      this._syncState.set('error');
      this._syncError.set(
        'Browser recovery is unavailable. Keep this tab open until cloud sync succeeds.',
      );
    }
  }

  private recoveryKey(projectId: number): string {
    return `${this.auth.user()?.id ?? 'signed-out'}:${projectId}`;
  }

  private clearTimer(): void {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }

  private emptyScene(): string {
    return '{"type":"excalidraw","version":2,"source":"taskflow","elements":[],"appState":{},"files":{}}';
  }

  private async runNodeMutation<T>(
    operation: (projectId: number) => import('rxjs').Observable<T>,
  ): Promise<T | null> {
    const projectId = this.activeProjectId;
    if (projectId === null || this._nodeSaving()) {
      return null;
    }
    this._nodeSaving.set(true);
    this._nodeError.set(null);
    try {
      const result = await firstValueFrom(operation(projectId));
      await this.refreshWorkspace(projectId);
      if (this._requirementBaselines().length) await this.loadRequirements(projectId);
      return result;
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      this._nodeError.set(
        httpError.status === 409
          ? 'That work item or canvas element is already linked. Refresh and try again.'
          : 'The linked work item could not be saved. Check the fields and try again.',
      );
      return null;
    } finally {
      this._nodeSaving.set(false);
    }
  }

  private async runResourceMutation<T>(
    operation: (projectId: number) => import('rxjs').Observable<T>,
  ): Promise<T | null> {
    const projectId = this.activeProjectId;
    if (projectId === null || this._nodeSaving()) return null;
    this._nodeSaving.set(true);
    this._nodeError.set(null);
    try {
      const result = await firstValueFrom(operation(projectId));
      await Promise.all([this.refreshWorkspace(projectId), this.loadResources(projectId)]);
      return result;
    } catch (error) {
      const response = error as HttpErrorResponse;
      const message = typeof response.error?.message === 'string' ? response.error.message : null;
      this._nodeError.set(message ?? 'The Planner resource could not be saved. Check the fields and file, then try again.');
      return null;
    } finally { this._nodeSaving.set(false); }
  }
}
