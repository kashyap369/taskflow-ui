export const API = {
  Auth: {
    Login: '/auth/login',
    Register: '/auth/register',
    Refresh: '/auth/refresh',
    Logout: '/auth/logout',
    VerifyEmail: '/auth/verify-email',
    ResendVerification: '/auth/resend-verification',
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
    Update: '/project',
    GetById: (id: number) => `/project/${id}`,
    Delete: (id: number) => `/project/${id}`,
    ByOrganization: (organizationId: number) => `/project/organization/${organizationId}`,
  },

  Task: {
    Create: '/task',
    /** Personal task (Individual account) — no organization, no project. */
    CreatePersonal: '/task/personal',
    Update: '/task',
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
} as const;