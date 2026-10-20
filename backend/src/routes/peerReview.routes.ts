import { Router } from 'express';
import { peerReviewController } from '../controllers/peerReview.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPeerReviewSchema } from '../validators/peerReview.validator';

const router = Router();

// Student: List classmates and see review completion status
router.get('/classmates', authenticate, authorizeRoles('student'), (req, res, next) =>
  peerReviewController.getClassmates(req, res).catch(next)
);

// Student: Submit or update a peer review
router.post('/submit', authenticate, authorizeRoles('student'), validate(createPeerReviewSchema), (req, res, next) =>
  peerReviewController.submitPeerReview(req, res).catch(next)
);

// Student: View 360° feedback received from classmates (strictly anonymous)
router.get('/my-received', authenticate, authorizeRoles('student'), (req, res, next) =>
  peerReviewController.getMyReceivedFeedback(req, res).catch(next)
);

// Student: View list of reviews authored by the student
router.get('/my-given', authenticate, authorizeRoles('student'), (req, res, next) =>
  peerReviewController.getMyGivenReviews(req, res).catch(next)
);

// Coordinator / Admin: Class-level participation matrix & summary
router.get('/class-overview', authenticate, authorizeRoles('coordinator', 'admin'), (req, res, next) =>
  peerReviewController.getClassOverview(req, res).catch(next)
);

export default router;
