export const API = {
  Auth: {
    Login: '/auth/login',
    Register: '/auth/register',
    Logout: '/auth/logout',
  },

  User: {
    GetAll: '/user',
    GetById: (id: number) => `/user/${id}`,
    Update: (id: number) => `/user/${id}`,
    Delete: (id: number) => `/user/${id}`,
  },

  Task: {
    GetAll: '/task',
    Create: '/task',
    GetById: (id: number) => `/task/${id}`,
  },
} as const;