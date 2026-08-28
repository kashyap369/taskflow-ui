import type { PlannerTemplateVersion } from '@core/models/planner-template.model';

export type PlannerSyncState =
  | 'loading'
  | 'ready'
  | 'saving'
  | 'saved'
  | 'offline'
  | 'error'
  | 'conflict';

export interface PlannerBoard {
  boardId: string;
  projectId: number;
  revision: number;
  sceneJson: string;
  updatedAt: string;
  lastOpenedAt: string | null;
}

export interface SavePlannerScenePayload {
  expectedRevision: number;
  sceneJson: string;
}

export interface SavePlannerSceneResult {
  boardId: string;
  revision: number;
  savedAt: string;
}

export interface PlannerSceneRevisionListItem {
  revision: number;
  createdAt: string;
  createdByUserId: number;
}

export interface PlannerSceneRevision extends PlannerSceneRevisionListItem {
  boardId: string;
  projectId: number;
  sceneJson: string;
}

export interface PlannerConflict {
  localSceneJson: string;
  remote: PlannerBoard;
}

export type PlannerNodeType = 1 | 2 | 3 | 4 | 5;
export type PlannerResourceKind = 1 | 2 | 3;
export type PlannerAssetScanStatus = 1 | 2 | 3 | 4;
export type RequirementEntityType = 1 | 2 | 3;
export type RequirementChangeType = 1 | 2 | 3;

export interface PlannerAsset {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  sha256: string;
  scanStatus: PlannerAssetScanStatus;
  createdAt: string;
}

export interface PlannerResource {
  id: string;
  boardId: string;
  projectId: number;
  kind: PlannerResourceKind;
  title: string;
  content: string | null;
  url: string | null;
  nodeId: string | null;
  elementId: string | null;
  asset: PlannerAsset | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface PlannerProjectSummary {
  title: string;
  description: string | null;
  problemStatement: string | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  approximateDurationWeeks: number | null;
  status: number;
  startDate: string;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  totalTaskCount: number;
  completedTaskCount: number;
  totalSubTaskCount: number;
  completedSubTaskCount: number;
  completionPercentage: number;
}

export interface PlannerNode {
  nodeId: string;
  elementId: string;
  nodeType: PlannerNodeType;
  entityId: number | null;
  parentEntityId: number | null;
  title: string;
  description: string | null;
  status: number;
  priority: number | null;
  startDate: string | null;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  childCount: number;
  completedChildCount: number;
  completionPercentage: number;
  problemStatement: string | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  approximateDurationWeeks: number | null;
  templateVersion: PlannerTemplateVersion | null;
  resourceId?: string | null;
  resourceKind?: PlannerResourceKind | null;
  resourceUrl?: string | null;
  asset?: PlannerAsset | null;
}

export interface PlannerWorkspace {
  boardId: string;
  projectId: number;
  project: PlannerProjectSummary;
  nodes: PlannerNode[];
}

export interface CreatePlannerTaskNodePayload {
  elementId: string;
  title: string;
  description: string;
  startDate: string;
  priority: number;
  expectedCompletionDate: string | null;
  templateVersionId?: string | null;
  changeReason?: string | null;
}

export interface CreatePlannerSubTaskNodePayload {
  elementId: string;
  taskId: number;
  title: string;
  templateVersionId?: string | null;
  changeReason?: string | null;
}

export interface UpdatePlannerNodePayload {
  title: string;
  description: string | null;
  expectedCompletionDate: string | null;
  priority: number | null;
  problemStatement: string | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  approximateDurationWeeks: number | null;
  changeReason?: string | null;
}

export interface RequirementBaselineListItem {
  id: string;
  baselineNumber: number;
  snapshotCount: number;
  finalizedByUserId: number;
  finalizedAt: string;
}

export interface RequirementSnapshot {
  id: string;
  entityType: RequirementEntityType;
  entityId: number;
  parentEntityId: number | null;
  orderIndex: number;
  title: string;
  fieldsJson: string;
  capturedAt: string;
}

export interface RequirementBaseline extends RequirementBaselineListItem {
  projectId: number;
  snapshots: RequirementSnapshot[];
}

export interface RequirementChange {
  id: string;
  entityType: RequirementEntityType;
  entityId: number;
  parentEntityId: number | null;
  changeType: RequirementChangeType;
  title: string;
  oldValuesJson: string | null;
  newValuesJson: string | null;
  actorUserId: number;
  changedAt: string;
  reason: string | null;
}

export interface RequirementFieldDifference {
  field: string;
  baselineValue: string | null;
  currentValue: string | null;
}

export interface RequirementComparisonItem {
  entityType: RequirementEntityType;
  entityId: number;
  parentEntityId: number | null;
  changeType: RequirementChangeType;
  title: string;
  actorUserId: number;
  changedAt: string;
  reason: string | null;
  differences: RequirementFieldDifference[];
}

export interface RequirementComparison {
  baselineId: string;
  baselineNumber: number;
  finalizedAt: string;
  items: RequirementComparisonItem[];
}

export interface CreatePlannerNotePayload { elementId: string; title: string; content: string; templateVersionId?: string | null; }
export interface CreatePlannerLinkPayload { elementId: string; title: string; url: string; templateVersionId?: string | null; }
export interface UpdatePlannerResourcePayload { title: string; content: string | null; url: string | null; fileName: string | null; }
