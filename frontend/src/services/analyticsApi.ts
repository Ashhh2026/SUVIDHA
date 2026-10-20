import { api } from './api';
import { DashboardMetrics } from '../types';

export const analyticsApi = {
  getDashboardMetrics: async (): Promise<{
    overview: DashboardMetrics;
    categoryDistribution: { category: string; count: number; avgRating: number }[];
    ratingScores: { rating: number; count: number }[];
    statusBreakdown: { status: string; count: number }[];
    departmentTrends: { department: string; feedbackCount: number; grievanceCount: number }[];
    monthlyTrends: { month: string; feedback: number; grievances: number }[];
    complaintThemes: { theme: string; count: number; sentimentRatio: string }[];
  }> => {
    const res = await api.get('/analytics/dashboard');
    return res.data.data;
  },
};
