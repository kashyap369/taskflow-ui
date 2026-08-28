export type PlannerObjectType = 1 | 2 | 3 | 4 | 5;
export type PlannerTemplateStatus = 1 | 2 | 3;
export interface PlannerTemplateVersion { id: string; versionNumber: number; objectType: PlannerObjectType; name: string; icon: string; header: string; backgroundColor: string; strokeColor: string; defaultWidth: number; defaultHeight: number; visibleFieldsJson: string; defaultValuesJson: string; publishedByUserId: number; publishedAt: string; }
export interface PlannerTemplate extends PlannerTemplateDefinition { id: string; status: PlannerTemplateStatus; currentVersionNumber: number | null; createdAt: string; updatedAt: string | null; versions: PlannerTemplateVersion[]; }
export interface PlannerTemplateDefinition { name: string; objectType: PlannerObjectType; icon: string; header: string; backgroundColor: string; strokeColor: string; defaultWidth: number; defaultHeight: number; visibleFieldsJson: string; defaultValuesJson: string; sortOrder: number; isActive: boolean; }
export const PLANNER_OBJECT_LABELS: Record<PlannerObjectType, string> = { 1: 'Project', 2: 'Task', 3: 'Subtask', 4: 'Note', 5: 'Document' };
export const PLANNER_TEMPLATE_STATUS_LABELS: Record<PlannerTemplateStatus, string> = { 1: 'Draft', 2: 'Published', 3: 'Archived' };
