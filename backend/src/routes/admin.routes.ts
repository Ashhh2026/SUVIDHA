import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { assignGrievanceSchema } from '../validators/grievance.validator';
import { updateUserRoleStatusSchema } from '../validators/admin.validator';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('coordinator', 'admin'));

// Grievances management
router.get('/grievances', AdminController.getAllGrievances);
router.put('/grievances/:id/assign', validate(assignGrievanceSchema), AdminController.assignGrievance);

// User administration
router.get('/users', AdminController.getUsers);
router.put('/users/:id', validate(updateUserRoleStatusSchema), AdminController.updateUser);

// Audit logs (Admin only)
router.get('/audit-logs', authorizeRoles('admin'), AdminController.getAuditLogs);

// Export CSV reports
router.get('/export', AdminController.exportReport);

export default router;
