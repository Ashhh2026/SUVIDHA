import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  static async getDashboardMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const [
        overview,
        categoryDistribution,
        ratingScores,
        statusBreakdown,
        departmentTrends,
        monthlyTrends,
        complaintThemes,
      ] = await Promise.all([
        AnalyticsService.getOverviewMetrics(),
        AnalyticsService.getFeedbackCategoryDistribution(),
        AnalyticsService.getRatingScoreDistribution(),
        AnalyticsService.getGrievanceStatusBreakdown(),
        AnalyticsService.getDepartmentWiseTrends(),
        AnalyticsService.getMonthlySubmissionTrends(),
        AnalyticsService.getFrequentComplaintThemes(),
      ]);

      res.json({
        success: true,
        data: {
          overview,
          categoryDistribution,
          ratingScores,
          statusBreakdown,
          departmentTrends,
          monthlyTrends,
          complaintThemes,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
