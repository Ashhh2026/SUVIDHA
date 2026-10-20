import { z } from 'zod';

export const createFeedbackSchema = z.object({
  category: z.enum([
    'course_curriculum',
    'faculty_teaching',
    'infrastructure_facilities',
    'library_laboratory',
    'hostel_mess',
    'campus_cleanliness',
    'transport_parking',
    'it_services',
    'general_suggestions',
    'other',
  ]),
  submissionMode: z.enum(['identified', 'anonymous']),
  department: z.string().optional(),
  course: z.string().optional(),
  subject: z.string().optional(),
  faculty: z.string().optional(),
  facility: z.string().optional(),
  overallRating: z.number().int().min(1).max(5),
  criteriaRatings: z
    .array(
      z.object({
        label: z.string().min(1),
        score: z.number().int().min(1).max(5),
      })
    )
    .optional()
    .default([]),
  comments: z.string().min(10, 'Comments must be at least 10 characters long').max(2000),
  suggestions: z.string().max(1000).optional(),
});
