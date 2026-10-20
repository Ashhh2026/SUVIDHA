import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(40);

      const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { isRead: true });
      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
