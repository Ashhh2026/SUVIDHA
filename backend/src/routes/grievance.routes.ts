import { Router } from 'express';
import { GrievanceController } from '../controllers/grievance.controller';
import { authenticate, optionalAuthenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createGrievanceSchema,
  updateGrievanceStatusSchema,
  studentReplySchema,
  reopenGrievanceSchema,
} from '../validators/grievance.validator';

const router = Router();

// Submit grievance (student or anonymous)
router.post('/submit', optionalAuthenticate, validate(createGrievanceSchema), GrievanceController.submit);

// Check duplicate active issues (student-facing assist)
router.get('/check-duplicates', GrievanceController.checkDuplicates);

// Track grievance anonymously using token
router.post('/track-anonymous', GrievanceController.trackAnonymous);

// Logged-in student's grievance history
router.get('/my', authenticate, authorizeRoles('student'), GrievanceController.getMyGrievances);

// Get single grievance details (role protected)
router.get('/:id', authenticate, GrievanceController.getById);

// Update status & post official response or internal note (faculty, coordinator, admin)
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('faculty', 'coordinator', 'admin'),
  validate(updateGrievanceStatusSchema),
  GrievanceController.updateStatus
);

// Reply to grievance (student or anonymous with token)
router.post(
  '/:id/reply',
  optionalAuthenticate,
  validate(studentReplySchema),
  GrievanceController.reply
);

// Reopen grievance (student)
router.post(
  '/:id/reopen',
  authenticate,
  authorizeRoles('student'),
  validate(reopenGrievanceSchema),
  GrievanceController.reopen
);

export default router;
