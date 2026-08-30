export const API = {
  Meeting: {
    Create: '/meeting',
    ByOrganization: (organizationId: number) => `/meeting/organization/${organizationId}`,
    GetById: (meetingId: number) => `/meeting/${meetingId}`,
    Update: (meetingId: number) => `/meeting/${meetingId}`,
    Start: (meetingId: number) => `/meeting/${meetingId}/start`,
    End: (meetingId: number) => `/meeting/${meetingId}/end`,
    Cancel: (meetingId: number) => `/meeting/${meetingId}/cancel`,
    AddBadge: (meetingId: number) => `/meeting/${meetingId}/badges`,
    AddParticipant: (meetingId: number) => `/meeting/${meetingId}/participants`,
    UpdateParticipant: (meetingId: number, participantId: number) =>
      `/meeting/${meetingId}/participants/${participantId}`,
    AccessLinks: (meetingId: number) => `/meeting/${meetingId}/access-links`,
    RevokeAccessLink: (meetingId: number, linkId: number) =>
      `/meeting/${meetingId}/access-links/${linkId}`,
  },
  Auth: {
    Login: '/auth/login',
    Register: '/auth/register',
    Refresh: '/auth/refresh',
    Logout: '/auth/logout',
    VerifyEmail: '/auth/verify-email',
    ResendVerification: '/auth/resend-verification',
    RequestLoginCode: '/auth/login-code/request',
    LoginWithCode: '/auth/login-code/verify',
    ForgotPassword: '/auth/password/forgot',
    ResetPassword: '/auth/password/reset',
  },

  // `UserController` is read-only — there is no PUT/DELETE on /user.
  User: {
    Me: '/user/me',
    GetAll: '/user',
    GetById: (id: number) => `/user/${id}`,
  },

  /**
   * Platform administration — every route is **AdminOnly**. This is the one controller whose data
   * isn't scoped to an organization, so the system role is the whole authorization story.
   */
  Admin: {
    Organizations: '/admin/organizations',
    Settings: '/admin/settings',
    PlannerTemplates: '/admin/planner/templates',
    PlannerTemplate: (id: string) => `/admin/planner/templates/${id}`,
    PublishPlannerTemplate: (id: string) => `/admin/planner/templates/${id}/publish`,
    ArchivePlannerTemplate: (id: string) => `/admin/planner/templates/${id}/archive`,
  },

  Organization: {
    Create: '/organization',
    Update: '/organization',
    Mine: '/organization/mine',
    GetById: (id: number) => `/organization/${id}`,
    Delete: (id: number) => `/organization/${id}`,
  },

  Report: {
    /** Personal report for the signed-in user — the caller's own tasks only. */
    Me: '/report/me',
    Dashboard: (organizationId: number) => `/report/dashboard/${organizationId}`,
    Member: (userId: number) => `/report/member/${userId}`,
    Team: (organizationId: number) => `/report/team/${organizationId}`,
    Project: (projectId: number) => `/report/project/${projectId}`,
  },

  Project: {
    Create: '/project',
    CreatePersonal: '/project/personal',
    Update: '/project',
    GetById: (id: number) => `/project/${id}`,
    Delete: (id: number) => `/project/${id}`,
    ByOrganization: (organizationId: number) => `/project/organization/${organizationId}`,
    MinePersonal: '/project/mine/personal',
  },

  Planner: {
    Templates: '/planner/templates',
    Board: (projectId: number) => `/planner/projects/${projectId}/board`,
    Scene: (projectId: number) => `/planner/projects/${projectId}/board/scene`,
    Revisions: (projectId: number) => `/planner/projects/${projectId}/board/revisions`,
    Revision: (projectId: number, revision: number) =>
      `/planner/projects/${projectId}/board/revisions/${revision}`,
    Workspace: (projectId: number) => `/planner/projects/${projectId}/board/workspace`,
    ProjectNode: (projectId: number) => `/planner/projects/${projectId}/board/nodes/project`,
    TaskNodes: (projectId: number) => `/planner/projects/${projectId}/board/nodes/tasks`,
    SubTaskNodes: (projectId: number) => `/planner/projects/${projectId}/board/nodes/subtasks`,
    Node: (projectId: number, nodeId: string) =>
      `/planner/projects/${projectId}/board/nodes/${nodeId}`,
    Resources: (projectId: number) => `/planner/projects/${projectId}/board/resources`,
    NoteResources: (projectId: number) => `/planner/projects/${projectId}/board/resources/notes`,
    LinkResources: (projectId: number) => `/planner/projects/${projectId}/board/resources/links`,
    DocumentResources: (projectId: number) => `/planner/projects/${projectId}/board/resources/documents`,
    Resource: (projectId: number, resourceId: string) =>
      `/planner/projects/${projectId}/board/resources/${resourceId}`,
    LinkResource: (projectId: number, resourceId: string) =>
      `/planner/projects/${projectId}/board/resources/${resourceId}/link`,
    ResourceContent: (projectId: number, resourceId: string) =>
      `/planner/projects/${projectId}/board/resources/${resourceId}/content`,
    FinalizeRequirements: (projectId: number) =>
      `/planner/projects/${projectId}/board/requirements/finalize`,
    RequirementBaselines: (projectId: number) =>
      `/planner/projects/${projectId}/board/requirements/baselines`,
    RequirementBaseline: (projectId: number, baselineId: string) =>
      `/planner/projects/${projectId}/board/requirements/baselines/${baselineId}`,
    RequirementChanges: (projectId: number) =>
      `/planner/projects/${projectId}/board/requirements/changes`,
    RequirementComparison: (projectId: number) =>
      `/planner/projects/${projectId}/board/requirements/compare`,
  },

  Task: {
    Create: '/task',
    /** Personal task (Individual account) — no organization, no project. */
    CreatePersonal: '/task/personal',
    Update: '/task',
    Schedule: (id: number) => `/task/${id}/schedule`,
    Estimate: (id: number) => `/task/${id}/estimate`,
    GetById: (id: number) => `/task/${id}`,
    Delete: (id: number) => `/task/${id}`,
    ByOrganization: (organizationId: number) => `/task/organization/${organizationId}`,
    ByProject: (projectId: number) => `/task/project/${projectId}`,
    Mine: '/task/mine',
    MinePersonal: '/task/mine/personal',
    Start: (id: number) => `/task/${id}/start`,
    Complete: (id: number) => `/task/${id}/complete`,
    Reopen: (id: number) => `/task/${id}/reopen`,
    Assign: (id: number, userId: number) => `/task/${id}/assign/${userId}`,
    Unassign: (id: number) => `/task/${id}/unassign`,
    /**
     * Team ownership lives on its own routes, NOT on `PUT /task` — the update command deliberately
     * omits `teamId` so a form save can't blank it (the same trap that bit `description`).
     */
    AssignTeam: (id: number, teamId: number) => `/task/${id}/team/${teamId}`,
    ClearTeam: (id: number) => `/task/${id}/team`,
  },

  Role: {
    Create: '/organizationrole',
    Update: '/organizationrole',
    GetById: (id: number) => `/organizationrole/${id}`,
    Delete: (id: number) => `/organizationrole/${id}`,
    ByOrganization: (organizationId: number) => `/organizationrole/organization/${organizationId}`,
    Permissions: '/organizationrole/permissions',
    Grant: '/organizationrole/grant-permission',
    Revoke: '/organizationrole/revoke-permission',
  },

  Member: {
    ByOrganization: (organizationId: number) =>
      `/organizationmember/organization/${organizationId}`,
    Activate: '/organizationmember/activate',
    Deactivate: '/organizationmember/deactivate',
    ChangeRole: '/organizationmember/change-role',
    Remove: '/organizationmember',
    Capacity: (organizationId: number, userId: number) =>
      `/organizationmember/organization/${organizationId}/users/${userId}/capacity`,
  },

  Invitation: {
    Invite: '/organizationinvitation/invite',
    Cancel: '/organizationinvitation/cancel',
    Accept: '/organizationinvitation/accept',
    Reject: '/organizationinvitation/reject',
    ByOrganization: (organizationId: number) =>
      `/organizationinvitation/organization/${organizationId}`,
    Mine: '/organizationinvitation/mine',
  },

  Team: {
    Create: '/team',
    Update: '/team',
    GetById: (id: number) => `/team/${id}`,
    Delete: (id: number) => `/team/${id}`,
    ByOrganization: (organizationId: number) => `/team/organization/${organizationId}`,
    AddMember: (teamId: number, userId: number) => `/team/${teamId}/members/${userId}`,
    RemoveMember: (teamId: number, userId: number) => `/team/${teamId}/members/${userId}`,
    /** The tasks this team owns (`Task.TeamId`) — teams grouped only people before backend Phase 11. */
    Tasks: (teamId: number) => `/team/${teamId}/tasks`,
  },

  SubTask: {
    Create: '/subtask',
    Update: '/subtask',
    Delete: (id: number) => `/subtask/${id}`,
    ByTask: (taskId: number) => `/subtask/task/${taskId}`,
    Complete: (id: number) => `/subtask/${id}/complete`,
    Reopen: (id: number) => `/subtask/${id}/reopen`,
  },

  WorkLog: {
    Start: '/worklog/start',
    Stop: '/worklog/stop',
    Manual: '/worklog/manual',
    Delete: (id: number) => `/worklog/${id}`,
    ByTask: (taskId: number) => `/worklog/task/${taskId}`,
    Mine: '/worklog/mine',
  },

  Capacity: {
    ByOrganization: (organizationId: number) => `/report/capacity/${organizationId}`,
  },

  Calendar: {
    Create: '/calendar',
    Update: '/calendar',
    Delete: (id: number) => `/calendar/${id}`,
    ByOrganization: (organizationId: number) => `/calendar/organization/${organizationId}`,
  },
} as const;
