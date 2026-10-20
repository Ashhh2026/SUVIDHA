import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(5).max(4000),
  priority: z.enum(['normal', 'important', 'urgent']).default('normal'),
  category: z.enum(['general', 'academic', 'maintenance', 'event']).default('general'),
  targetDepartment: z.string().nullable().optional(),
  targetRole: z.enum(['all', 'student', 'faculty']).default('all'),
  expiresAt: z.string().optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(10).toUpperCase(),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().optional(),
  coordinator: z.string().optional(),
});

export const createCourseSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(15).toUpperCase(),
  department: z.string().min(1),
  durationYears: z.number().int().min(1).max(6).default(4),
  totalSemesters: z.number().int().min(1).max(12).default(8),
});

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(15).toUpperCase(),
  department: z.string().min(1),
  course: z.string().min(1),
  semester: z.number().int().min(1).max(12),
  faculty: z.array(z.string()).optional(),
});

export const updateUserRoleStatusSchema = z.object({
  role: z.enum(['student', 'faculty', 'coordinator', 'admin']).optional(),
  isActive: z.boolean().optional(),
  department: z.string().nullable().optional(),
});
