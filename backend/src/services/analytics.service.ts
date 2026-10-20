import { Feedback } from '../models/Feedback';
import { Grievance } from '../models/Grievance';
import { User } from '../models/User';
import { Department } from '../models/Department';

export class AnalyticsService {
  static async getOverviewMetrics(): Promise<{
    totalStudents: number;
    totalFeedback: number;
    totalGrievances: number;
    openGrievances: number;
    resolvedGrievances: number;
    resolutionRate: number;
    avgResolutionDays: number;
    avgFeedbackRating: number;
    overdueGrievances: number;
  }> {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFeedback = await Feedback.countDocuments();
    const totalGrievances = await Grievance.countDocuments();

    const openGrievances = await Grievance.countDocuments({
      status: { $in: ['submitted', 'under_review', 'assigned', 'in_progress', 'awaiting_student_info', 'reopened'] },
    });

    const resolvedGrievances = await Grievance.countDocuments({
      status: { $in: ['resolved', 'closed'] },
    });

    const overdueGrievances = await Grievance.countDocuments({
      status: { $nin: ['resolved', 'closed'] },
      targetResolutionDate: { $lt: new Date() },
    });

    // Average feedback rating
    const ratingAgg = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$overallRating' } } },
    ]);
    const avgFeedbackRating = ratingAgg.length > 0 ? Number(ratingAgg[0].avgRating.toFixed(2)) : 0;

    // Average resolution time in days for resolved grievances
    const resolvedItems = await Grievance.find({
      status: { $in: ['resolved', 'closed'] },
      resolvedAt: { $exists: true, $ne: null },
    }).select('createdAt resolvedAt');

    let avgResolutionDays = 0;
    if (resolvedItems.length > 0) {
      const totalMs = resolvedItems.reduce((acc, item) => {
        const diff = item.resolvedAt!.getTime() - item.createdAt.getTime();
        return acc + Math.max(0, diff);
      }, 0);
      avgResolutionDays = Number((totalMs / (resolvedItems.length * 24 * 60 * 60 * 1000)).toFixed(1));
    }

    const resolutionRate =
      totalGrievances > 0 ? Number(((resolvedGrievances / totalGrievances) * 100).toFixed(1)) : 0;

    return {
      totalStudents,
      totalFeedback,
      totalGrievances,
      openGrievances,
      resolvedGrievances,
      resolutionRate,
      avgResolutionDays,
      avgFeedbackRating,
      overdueGrievances,
    };
  }

  static async getFeedbackCategoryDistribution(): Promise<{ category: string; count: number; avgRating: number }[]> {
    const data = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return data.map((item) => ({
      category: item._id,
      count: item.count,
      avgRating: Number(item.avgRating.toFixed(1)),
    }));
  }

  static async getRatingScoreDistribution(): Promise<{ rating: number; count: number }[]> {
    const data = await Feedback.aggregate([
      { $group: { _id: '$overallRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const result = [1, 2, 3, 4, 5].map((score) => {
      const found = data.find((d) => d._id === score);
      return { rating: score, count: found ? found.count : 0 };
    });

    return result;
  }

  static async getGrievanceStatusBreakdown(): Promise<{ status: string; count: number }[]> {
    const data = await Grievance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return data.map((item) => ({
      status: item._id,
      count: item.count,
    }));
  }

  static async getDepartmentWiseTrends(): Promise<{ department: string; feedbackCount: number; grievanceCount: number }[]> {
    const departments = await Department.find({ isActive: true }).select('name code');

    const result = await Promise.all(
      departments.map(async (dept) => {
        const feedbackCount = await Feedback.countDocuments({ department: dept._id });
        const grievanceCount = await Grievance.countDocuments({ department: dept._id });
        return {
          department: dept.code || dept.name,
          feedbackCount,
          grievanceCount,
        };
      })
    );

    return result;
  }

  static async getMonthlySubmissionTrends(): Promise<{ month: string; feedback: number; grievances: number }[]> {
    // Generate data for the last 6 months
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const now = new Date();
    const trendData: { month: string; feedback: number; grievances: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthName = start.toLocaleString('default', { month: 'short' });
      const feedbackCount = await Feedback.countDocuments({ createdAt: { $gte: start, $lte: end } });
      const grievanceCount = await Grievance.countDocuments({ createdAt: { $gte: start, $lte: end } });

      trendData.push({
        month: monthName,
        feedback: feedbackCount,
        grievances: grievanceCount,
      });
    }

    return trendData;
  }

  // Feature 14-A: Smart Feedback Insights (Top campus themes & recurring topics)
  static async getFrequentComplaintThemes(): Promise<{ theme: string; count: number; sentimentRatio: string }[]> {
    const allFeedback = await Feedback.find().select('tags sentiment');
    const tagCountMap: Record<string, { total: number; negative: number }> = {};

    allFeedback.forEach((fb) => {
      fb.tags.forEach((tag) => {
        if (!tagCountMap[tag]) tagCountMap[tag] = { total: 0, negative: 0 };
        tagCountMap[tag].total += 1;
        if (fb.sentiment === 'negative') tagCountMap[tag].negative += 1;
      });
    });

    const themes = Object.entries(tagCountMap)
      .map(([theme, counts]) => ({
        theme: theme.replace('_', ' ').toUpperCase(),
        count: counts.total,
        sentimentRatio: `${Math.round((counts.negative / counts.total) * 100)}% critical`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return themes;
  }
}
