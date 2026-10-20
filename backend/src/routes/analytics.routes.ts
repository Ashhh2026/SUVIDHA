import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

// Analytics is viewable by coordinator and admin
router.get(
  '/dashboard',
  authenticate,
  authorizeRoles('coordinator', 'admin'),
  AnalyticsController.getDashboardMetrics
);

export default router;
