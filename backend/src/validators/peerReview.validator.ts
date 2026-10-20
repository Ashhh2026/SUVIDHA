import { z } from 'zod';

export const createPeerReviewSchema = z.object({
  revieweeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reviewee ID format'),
  ratings: z.object({
    teamwork: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    communication: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    problemSolving: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    punctuality: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  }),
  strengths: z.array(z.string().trim().max(50)).optional().default([]),
  areasForImprovement: z.string().trim().max(1000).optional(),
  comments: z.string().trim().max(1500).optional(),
  isAnonymous: z.boolean().optional().default(true),
});

export type CreatePeerReviewInput = z.infer<typeof createPeerReviewSchema>;
