import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { FeedbackService } from '../services/feedback.service';
import { Grievance } from '../models/Grievance';

export class FacultyController {
  static async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const facultyId = req.user!._id;

      // Fetch assigned grievances
      const assignedGrievances = await Grievance.find({ assignedTo: facultyId })
        .populate('department', 'name code')
        .sort({ updatedAt: -1 });

      // Fetch student feedback with privacy threshold
      const feedbackAnalytics = await FeedbackService.getFacultyFeedback(facultyId.toString(), 2);

      const pendingCount = assignedGrievances.filter((g) =>
        ['assigned', 'in_progress', 'awaiting_student_info'].includes(g.status)
      ).length;

      const resolvedCount = assignedGrievances.filter((g) =>
        ['resolved', 'closed'].includes(g.status)
      ).length;

      res.json({
        success: true,
        data: {
          metrics: {
            totalAssignedGrievances: assignedGrievances.length,
            pendingGrievances: pendingCount,
            resolvedGrievances: resolvedCount,
            averageFeedbackRating: feedbackAnalytics.averageRating,
            totalFeedbackCount: feedbackAnalytics.totalCount,
            sufficientData: feedbackAnalytics.sufficientData,
          },
          assignedGrievances,
          feedbackAnalytics,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getAssignedGrievances(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const facultyId = req.user!._id;
      const grievances = await Grievance.find({ assignedTo: facultyId })
        .populate('department', 'name code')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: { grievances } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const facultyId = req.user!._id;
      const feedbackData = await FeedbackService.getFacultyFeedback(facultyId.toString(), 2);

      res.json({ success: true, data: feedbackData });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
