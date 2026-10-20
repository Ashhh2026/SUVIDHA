import { api } from './api';
import { Grievance, User } from '../types';

export const adminApi = {
  getAllGrievances: async (params?: Record<string, any>): Promise<{
    grievances: Grievance[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const res = await api.get('/admin/grievances', { params });
    return res.data.data;
  },

  assignGrievance: async (
    id: string,
    data: { assignedTo: string; targetResolutionDate?: string; notes?: string }
  ): Promise<string> => {
    const res = await api.put(`/admin/grievances/${id}/assign`, data);
    return res.data.message;
  },

  getUsers: async (params?: Record<string, any>): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  updateUser: async (
    id: string,
    data: { role?: string; isActive?: boolean; department?: string | null }
  ): Promise<User> => {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data.data.user;
  },

  getAuditLogs: async (params?: Record<string, any>): Promise<{
    logs: any[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data.data;
  },

  exportReport: async (type: 'feedback' | 'grievances'): Promise<Blob> => {
    const res = await api.get(`/admin/export?type=${type}`, { responseType: 'blob' });
    return res.data;
  },
};
