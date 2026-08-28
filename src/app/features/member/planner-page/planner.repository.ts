import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/api/api.service';
import { API } from '@core/api/api-endpoints';
import {
  PlannerBoard,
  PlannerSceneRevision,
  PlannerSceneRevisionListItem,
  SavePlannerScenePayload,
  SavePlannerSceneResult,
  PlannerWorkspace,
  CreatePlannerTaskNodePayload,
  CreatePlannerSubTaskNodePayload,
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
import { PlannerTemplate } from '@core/models/planner-template.model';

@Injectable({ providedIn: 'root' })
export class PlannerRepository {
  private readonly api = inject(ApiService);

  getTemplates(): Observable<PlannerTemplate[]> {
    return this.api.getSilently<PlannerTemplate[]>(API.Planner.Templates);
  }

  getBoard(projectId: number): Observable<PlannerBoard> {
    return this.api.getSilently<PlannerBoard>(API.Planner.Board(projectId));
  }

  saveScene(
    projectId: number,
    payload: SavePlannerScenePayload,
  ): Observable<SavePlannerSceneResult> {
    return this.api.putSilently<SavePlannerSceneResult>(API.Planner.Scene(projectId), payload);
  }

  getRevisions(projectId: number): Observable<PlannerSceneRevisionListItem[]> {
    return this.api.getSilently<PlannerSceneRevisionListItem[]>(API.Planner.Revisions(projectId));
  }

  getRevision(projectId: number, revision: number): Observable<PlannerSceneRevision> {
    return this.api.getSilently<PlannerSceneRevision>(API.Planner.Revision(projectId, revision));
  }

  getWorkspace(projectId: number): Observable<PlannerWorkspace> {
    return this.api.getSilently<PlannerWorkspace>(API.Planner.Workspace(projectId));
  }

  linkProject(projectId: number, elementId: string, templateVersionId?: string | null): Observable<string> {
    return this.api.postSilently<string>(API.Planner.ProjectNode(projectId), { elementId, templateVersionId });
  }

  createTaskNode(projectId: number, payload: CreatePlannerTaskNodePayload): Observable<string> {
    return this.api.postSilently<string>(API.Planner.TaskNodes(projectId), payload);
  }

  createSubTaskNode(projectId: number, payload: CreatePlannerSubTaskNodePayload): Observable<string> {
    return this.api.postSilently<string>(API.Planner.SubTaskNodes(projectId), payload);
  }

  updateNode(projectId: number, nodeId: string, payload: UpdatePlannerNodePayload): Observable<void> {
    return this.api.putSilently<void>(API.Planner.Node(projectId, nodeId), payload);
  }

  removeNode(projectId: number, nodeId: string, deleteEntity: boolean, changeReason?: string | null): Observable<void> {
    const reason = changeReason ? `&changeReason=${encodeURIComponent(changeReason)}` : '';
    return this.api.deleteSilently<void>(`${API.Planner.Node(projectId, nodeId)}?deleteEntity=${deleteEntity}${reason}`);
  }


  getResources(projectId: number): Observable<PlannerResource[]> {
    return this.api.getSilently<PlannerResource[]>(API.Planner.Resources(projectId));
  }

  createNote(projectId: number, payload: CreatePlannerNotePayload): Observable<string> {
    return this.api.postSilently<string>(API.Planner.NoteResources(projectId), payload);
  }

  createLink(projectId: number, payload: CreatePlannerLinkPayload): Observable<string> {
    return this.api.postSilently<string>(API.Planner.LinkResources(projectId), payload);
  }

  uploadDocument(projectId: number, elementId: string, title: string, file: File,
    templateVersionId?: string | null): Observable<string> {
    const form = new FormData();
    form.append('elementId', elementId);
    form.append('title', title);
    if (templateVersionId) form.append('templateVersionId', templateVersionId);
    form.append('file', file, file.name);
    return this.api.postSilently<string>(API.Planner.DocumentResources(projectId), form);
  }

  linkResource(projectId: number, resourceId: string, elementId: string,
    templateVersionId?: string | null): Observable<string> {
    return this.api.postSilently<string>(API.Planner.LinkResource(projectId, resourceId),
      { elementId, templateVersionId });
  }

  updateResource(projectId: number, resourceId: string,
    payload: UpdatePlannerResourcePayload): Observable<void> {
    return this.api.putSilently<void>(API.Planner.Resource(projectId, resourceId), payload);
  }

  deleteResource(projectId: number, resourceId: string): Observable<void> {
    return this.api.deleteSilently<void>(API.Planner.Resource(projectId, resourceId));
  }

  getResourceContent(projectId: number, resourceId: string, download = false): Observable<Blob> {
    return this.api.getBlobSilently(`${API.Planner.ResourceContent(projectId, resourceId)}?download=${download}`);
  }

  finalizeRequirements(projectId: number): Observable<RequirementBaseline> {
    return this.api.postSilently<RequirementBaseline>(API.Planner.FinalizeRequirements(projectId), {});
  }

  getRequirementBaselines(projectId: number): Observable<RequirementBaselineListItem[]> {
    return this.api.getSilently<RequirementBaselineListItem[]>(API.Planner.RequirementBaselines(projectId));
  }

  getRequirementBaseline(projectId: number, baselineId: string): Observable<RequirementBaseline> {
    return this.api.getSilently<RequirementBaseline>(API.Planner.RequirementBaseline(projectId, baselineId));
  }

  getRequirementChanges(projectId: number, changeType?: RequirementChangeType | null): Observable<RequirementChange[]> {
    const query = changeType ? `?changeType=${changeType}` : '';
    return this.api.getSilently<RequirementChange[]>(`${API.Planner.RequirementChanges(projectId)}${query}`);
  }

  compareRequirements(projectId: number, baselineId?: string | null,
    changeType?: RequirementChangeType | null): Observable<RequirementComparison | null> {
    const params = new URLSearchParams();
    if (baselineId) params.set('baselineId', baselineId);
    if (changeType) params.set('changeType', String(changeType));
    const query = params.size ? `?${params.toString()}` : '';
    return this.api.getSilently<RequirementComparison | null>(`${API.Planner.RequirementComparison(projectId)}${query}`);
  }
}
