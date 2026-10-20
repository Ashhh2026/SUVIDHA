import { api } from './api';
import { Feedback } from '../types';

export const feedbackApi = {
  submit: async (data: any): Promise<{ feedback: Feedback; referenceNumber: string }> => {
    const res = await api.post('/feedback/submit', data);
    return res.data.data;
  },

  getMyFeedbacks: async (): Promise<Feedback[]> => {
    const res = await api.get('/feedback/my');
    return res.data.data.feedbacks;
  },

  getAllFeedbacks: async (params?: Record<string, any>): Promise<{
    feedbacks: Feedback[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const res = await api.get('/feedback/all', { params });
    return res.data.data;
  },
};
