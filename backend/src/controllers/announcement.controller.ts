import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Announcement } from '../models/Announcement';
import { logAuditEvent } from '../services/audit.service';

export class AnnouncementController {
  static async getActiveAnnouncements(_req: Request, res: Response): Promise<void> {
    try {
      const announcements = await Announcement.find({
        isActive: true,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      })
        .populate('author', 'name role')
        .populate('targetDepartment', 'name code')
        .sort({ priority: -1, createdAt: -1 });

      res.json({ success: true, data: { announcements } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createAnnouncement(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const announcement = await Announcement.create({
        ...req.body,
        author: req.user!._id,
      });

      await logAuditEvent({
        userId: req.user!._id.toString(),
        action: 'ANNOUNCEMENT_CREATED',
        category: 'admin',
        details: { title: announcement.title, priority: announcement.priority },
      });

      res.status(201).json({
        success: true,
        message: 'Announcement published successfully.',
        data: { announcement },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
