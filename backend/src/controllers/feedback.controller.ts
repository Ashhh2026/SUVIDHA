import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { FeedbackService } from '../services/feedback.service';

export class FeedbackController {
  static async submit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user?._id?.toString();
      const feedback = await FeedbackService.submitFeedback(
        req.body,
        studentId,
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      );

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully. Thank you for your valuable response!',
        data: {
          feedback,
          referenceNumber: feedback.referenceNumber,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getMyFeedbacks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!._id.toString();
      const feedbacks = await FeedbackService.getStudentFeedbacks(studentId);
      res.json({ success: true, data: { feedbacks } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category, department, status, rating, search, page, limit } = req.query;
      const result = await FeedbackService.getAllFeedbacks({
        category: category as string,
        department: department as string,
        status: status as string,
        rating: rating ? parseInt(rating as string, 10) : undefined,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
