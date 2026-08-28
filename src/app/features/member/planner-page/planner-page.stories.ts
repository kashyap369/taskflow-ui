import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';

import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { ProjectStatus } from '../member.models';
import { MemberFacade } from '../member.facade';
import { PlannerPage } from './planner-page';
import { PlannerFacade } from './planner.facade';

const projects = signal([
  {
    id: 11,
    organizationId: null,
    title: 'TaskFlow Planner rollout',
    description: 'Plan the Planner release.',
    status: ProjectStatus.Active,
    startDate: '2026-08-01T00:00:00Z',
    expectedCompletionDate: '2026-10-30T00:00:00Z',
    actualCompletionDate: null,
    createdByUserId: 7,
    taskCount: 12,
    completedTaskCount: 4,
    completionPercentage: 33.33,
  },
  {
    id: 22,
    organizationId: null,
    title: 'Personal portfolio',
    description: null,
    status: ProjectStatus.Draft,
    startDate: '2026-08-20T00:00:00Z',
    expectedCompletionDate: null,
    actualCompletionDate: null,
    createdByUserId: 7,
    taskCount: 3,
    completedTaskCount: 0,
    completionPercentage: 0,
  },
]);

const plannerFacade = {
  projects,
  projectsLoading: signal(false),
  projectsError: signal<string | null>(null),
  saving: signal(false),
  initProjects: () => undefined,
  loadProjects: () => undefined,
  createProject: (_payload: unknown, onCreated?: (projectId: number) => void) => onCreated?.(11),
};

const cloudPlannerFacade = {
  syncState: signal<'ready'>('ready'),
  syncError: signal<string | null>(null),
  conflict: signal(null),
  savedAt: signal(new Date()),
  recoveryAvailable: signal(true),
  workspace: signal(null),
  nodesLoading: signal(false),
  nodeSaving: signal(false),
  nodeError: signal(null),
  templates: signal([]), templatesLoading: signal(false), resources: signal([]), resourcesLoading: signal(false),
  openProject: async () =>
    '{"type":"excalidraw","version":2,"source":"taskflow","elements":[],"appState":{},"files":{}}',
  stageScene: () => undefined,
  reportEmbeddedFiles: () => undefined,
  flush: async () => undefined,
  retry: () => undefined,
  keepLocalVersion: async () => undefined,
  useServerVersion: async () => null,
  refreshWorkspace: async () => null,
  linkProject: async () => null,
  createTaskNode: async () => null,
  createSubTaskNode: async () => null,
  updateNode: async () => false,
  removeNode: async () => false,
  loadTemplates: async () => undefined, loadResources: async () => undefined,
  createNote: async () => null, createLink: async () => null, uploadDocument: async () => null,
  linkResource: async () => null, updateResource: async () => false,
  deleteResource: async () => false, getResourceContent: async () => null,
};

const meta: Meta<PlannerPage> = {
  title: 'Features/Planner/Workspace',
  component: PlannerPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: MemberFacade, useValue: plannerFacade },
        { provide: PlannerFacade, useValue: cloudPlannerFacade },
        { provide: AuthService, useValue: { user: signal({ id: 7 }) } },
        { provide: ThemeService, useValue: { isDark: signal(false) } },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<PlannerPage>;

export const Default: Story = {};
