import { Notification } from '../models/Notification';
import { logger } from '../config/logger';

export const createNotification = async (params: {
  recipientId: string;
  title: string;
  message: string;
  type?: 'feedback' | 'grievance' | 'announcement' | 'system';
  relatedId?: string;
  link?: string;
}): Promise<void> => {
  try {
    await Notification.create({
      recipient: params.recipientId,
      title: params.title,
      message: params.message,
      type: params.type || 'system',
      relatedId: params.relatedId,
      link: params.link,
      isRead: false,
    });
  } catch (err: any) {
    logger.error('Failed to create notification:', err.message);
  }
};
