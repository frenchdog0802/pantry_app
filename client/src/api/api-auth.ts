// src/api/Api-auth.ts
import { api } from './Client';
import type { User } from './Types';

export const auth = {
  signin: (user: User) => api.post<User>('/api/auth/signin', user),

  signout: () => api.get('/api/auth/signout'),

  googleAuthLogin: (token: string) =>
    api.post<{ token: string }>('/api/auth/google-login', { token }),
};
