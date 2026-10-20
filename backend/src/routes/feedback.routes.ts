import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { optionalAuthenticate, authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFeedbackSchema } from '../validators/feedback.validator';

const router = Router();

// Submitting feedback: allows anonymous or logged in students
router.post('/submit', optionalAuthenticate, validate(createFeedbackSchema), FeedbackController.submit);

// Student's own identified feedback
router.get('/my', authenticate, authorizeRoles('student'), FeedbackController.getMyFeedbacks);

// Admin / Coordinator view of all feedback
router.get('/all', authenticate, authorizeRoles('coordinator', 'admin'), FeedbackController.getAll);

export default router;
