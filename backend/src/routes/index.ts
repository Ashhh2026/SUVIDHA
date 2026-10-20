import { Router } from 'express';
import authRoutes from './auth.routes';
import feedbackRoutes from './feedback.routes';
import grievanceRoutes from './grievance.routes';
import facultyRoutes from './faculty.routes';
import adminRoutes from './admin.routes';
import departmentRoutes from './department.routes';
import notificationRoutes from './notification.routes';
import announcementRoutes from './announcement.routes';
import analyticsRoutes from './analytics.routes';
import peerReviewRoutes from './peerReview.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/grievances', grievanceRoutes);
router.use('/faculty', facultyRoutes);
router.use('/admin', adminRoutes);
router.use('/academic', departmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/announcements', announcementRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/peer-reviews', peerReviewRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SUVIDHA Backend API',
    version: '1.0.0',
  });
});

export default router;
