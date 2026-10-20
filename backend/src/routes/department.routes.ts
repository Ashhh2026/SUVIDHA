import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createDepartmentSchema,
  createCourseSchema,
  createSubjectSchema,
} from '../validators/admin.validator';

const router = Router();

// Public / Authenticated read routes for selecting departments, courses, subjects
router.get('/departments', DepartmentController.getAllDepartments);
router.get('/courses', DepartmentController.getCourses);
router.get('/subjects', DepartmentController.getSubjects);
router.get('/faculty-list', DepartmentController.getFacultyList);

// Admin / Coordinator write routes
router.post(
  '/departments',
  authenticate,
  authorizeRoles('admin'),
  validate(createDepartmentSchema),
  DepartmentController.createDepartment
);

router.post(
  '/courses',
  authenticate,
  authorizeRoles('admin', 'coordinator'),
  validate(createCourseSchema),
  DepartmentController.createCourse
);

router.post(
  '/subjects',
  authenticate,
  authorizeRoles('admin', 'coordinator'),
  validate(createSubjectSchema),
  DepartmentController.createSubject
);

export default router;
