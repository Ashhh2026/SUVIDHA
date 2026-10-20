import { api } from './api';
import { Notification, Announcement } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  getActiveAnnouncements: async (): Promise<Announcement[]> => {
    const res = await api.get('/announcements');
    return res.data.data.announcements;
  },

  createAnnouncement: async (data: any): Promise<Announcement> => {
    const res = await api.post('/announcements', data);
    return res.data.data.announcement;
  },
};
