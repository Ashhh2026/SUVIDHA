import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAnnouncementSchema } from '../validators/admin.validator';

const router = Router();

router.get('/', AnnouncementController.getActiveAnnouncements);
router.post(
  '/',
  authenticate,
  authorizeRoles('coordinator', 'admin'),
  validate(createAnnouncementSchema),
  AnnouncementController.createAnnouncement
);

export default router;
