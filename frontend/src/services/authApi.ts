import { api, setAuthToken } from './api';
import { User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; accessToken: string }> => {
    const res = await api.post('/auth/login', { email, password });
    const { user, accessToken } = res.data.data;
    setAuthToken(accessToken);
    return { user, accessToken };
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    studentId?: string;
    department?: string;
    course?: string;
    semester?: number;
  }): Promise<{ userId: string; verificationToken?: string }> => {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  verifyEmail: async (token: string): Promise<string> => {
    const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return res.data.message;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAuthToken(null);
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string; resetToken?: string }> => {
    const res = await api.post('/auth/forgot-password', { email });
    return { message: res.data.message, resetToken: res.data.data?.resetToken };
  },

  resetPassword: async (token: string, password: string): Promise<string> => {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data.message;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data.message;
  },
};
