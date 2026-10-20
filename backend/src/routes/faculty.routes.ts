import { Router } from 'express';
import { FacultyController } from '../controllers/faculty.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('faculty', 'coordinator', 'admin'));

router.get('/dashboard', FacultyController.getDashboard);
router.get('/grievances', FacultyController.getAssignedGrievances);
router.get('/feedback', FacultyController.getFeedback);

export default router;
