import { z } from 'zod';

export const createGrievanceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Please provide sufficient details (at least 20 characters)').max(5000),
  category: z.enum([
    'academic',
    'administrative',
    'facilities',
    'examination',
    'harassment_misconduct',
    'technical',
    'other',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  submissionMode: z.enum(['identified', 'anonymous']),
  department: z.string().optional(),
  incidentDate: z.string().optional(),
  location: z.string().max(150).optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().max(10 * 1024 * 1024, 'Attachment exceeds 10MB limit'),
        fileType: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const updateGrievanceStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'under_review',
    'assigned',
    'in_progress',
    'awaiting_student_info',
    'resolved',
    'closed',
    'reopened',
  ]),
  message: z.string().min(2, 'Message or resolution note is required').max(3000),
  isInternalOnly: z.boolean().default(false),
  resolutionSummary: z.string().optional(),
});

export const assignGrievanceSchema = z.object({
  assignedTo: z.string().min(1, 'Target assignee is required'),
  targetResolutionDate: z.string().optional(),
  notes: z.string().optional(),
});

export const reopenGrievanceSchema = z.object({
  reopenReason: z.string().min(10, 'Please provide a clear reason for reopening (at least 10 characters)'),
});

export const studentReplySchema = z.object({
  message: z.string().min(2, 'Reply message cannot be empty').max(3000),
  token: z.string().optional(), // if anonymous
});
