export const API = {
  Auth: {
    Login: '/auth/login',
    Register: '/auth/register',
    Refresh: '/auth/refresh',
    Logout: '/auth/logout',
  },

  User: {
    Me: '/user/me',
    GetAll: '/user',
    GetById: (id: number) => `/user/${id}`,
    Update: (id: number) => `/user/${id}`,
    Delete: (id: number) => `/user/${id}`,
  },

  Organization: {
    Create: '/organization',
    Update: '/organization',
    Mine: '/organization/mine',
    GetById: (id: number) => `/organization/${id}`,
    Delete: (id: number) => `/organization/${id}`,
  },

  Report: {
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
    Update: '/task',
    GetById: (id: number) => `/task/${id}`,
    Delete: (id: number) => `/task/${id}`,
    ByOrganization: (organizationId: number) => `/task/organization/${organizationId}`,
    ByProject: (projectId: number) => `/task/project/${projectId}`,
    Mine: '/task/mine',
    Start: (id: number) => `/task/${id}/start`,
    Complete: (id: number) => `/task/${id}/complete`,
    Assign: (id: number, userId: number) => `/task/${id}/assign/${userId}`,
    Unassign: (id: number) => `/task/${id}/unassign`,
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
  },
} as const;