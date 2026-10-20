import { api } from './api';
import { Grievance, GrievanceUpdate } from '../types';

export const grievanceApi = {
  submit: async (data: any): Promise<{ grievance: Grievance; referenceNumber: string; trackingToken?: string }> => {
    const res = await api.post('/grievances/submit', data);
    return res.data.data;
  },

  getMyGrievances: async (): Promise<Grievance[]> => {
    const res = await api.get('/grievances/my');
    return res.data.data.grievances;
  },

  getById: async (id: string): Promise<{ grievance: Grievance; updates: GrievanceUpdate[] }> => {
    const res = await api.get(`/grievances/${id}`);
    return res.data.data;
  },

  trackAnonymous: async (token: string): Promise<{ grievance: Grievance; updates: GrievanceUpdate[] }> => {
    const res = await api.post('/grievances/track-anonymous', { token });
    return res.data.data;
  },

  updateStatus: async (
    id: string,
    data: { status: string; message: string; isInternalOnly?: boolean; resolutionSummary?: string }
  ): Promise<GrievanceUpdate> => {
    const res = await api.put(`/grievances/${id}/status`, data);
    return res.data.data.update;
  },

  reply: async (id: string, data: { message: string; token?: string }): Promise<GrievanceUpdate> => {
    const res = await api.post(`/grievances/${id}/reply`, data);
    return res.data.data.update;
  },

  reopen: async (id: string, reopenReason: string): Promise<string> => {
    const res = await api.post(`/grievances/${id}/reopen`, { reopenReason });
    return res.data.message;
  },

  checkDuplicates: async (category: string, title: string, department?: string): Promise<any[]> => {
    const res = await api.get('/grievances/check-duplicates', {
      params: { category, title, department },
    });
    return res.data.data.duplicates;
  },
};
