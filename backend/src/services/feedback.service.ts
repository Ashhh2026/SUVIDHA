import { Feedback, IFeedback, FeedbackCategory, SubmissionMode } from '../models/Feedback';
import { generateFeedbackReference } from '../utils/reference';
import { createNotification } from './notification.service';
import { logAuditEvent } from './audit.service';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Simple transparent keyword & sentiment tagger
const deriveSentimentAndTags = (
  rating: number,
  comments: string
): { sentiment: 'positive' | 'neutral' | 'negative'; tags: string[] } => {
  const text = comments.toLowerCase();
  const tags: string[] = [];

  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet')) tags.push('it_wifi');
  if (text.includes('clean') || text.includes('washroom') || text.includes('hygiene')) tags.push('hygiene');
  if (text.includes('library') || text.includes('book')) tags.push('library');
  if (text.includes('lab') || text.includes('equipment') || text.includes('computer')) tags.push('laboratory');
  if (text.includes('mess') || text.includes('food') || text.includes('canteen')) tags.push('mess_food');
  if (text.includes('teach') || text.includes('lecture') || text.includes('professor')) tags.push('academics');
  if (text.includes('hostel') || text.includes('room')) tags.push('hostel');

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (rating >= 4) {
    sentiment = 'positive';
  } else if (rating <= 2) {
    sentiment = 'negative';
  }

  return { sentiment, tags };
};

export class FeedbackService {
  static async submitFeedback(
    data: {
      category: FeedbackCategory;
      submissionMode: SubmissionMode;
      department?: string;
      course?: string;
      subject?: string;
      faculty?: string;
      facility?: string;
      overallRating: number;
      criteriaRatings?: { label: string; score: number }[];
      comments: string;
      suggestions?: string;
    },
    studentId?: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<IFeedback> {
    const referenceNumber = generateFeedbackReference();
    const { sentiment, tags } = deriveSentimentAndTags(data.overallRating, data.comments);

    // CRITICAL PRIVACY CONTROL:
    // If submissionMode === 'anonymous', explicitly set student to null.
    // Never store studentId or account linkage for anonymous submissions.
    const isAnonymous = data.submissionMode === 'anonymous';
    const linkedStudentId = isAnonymous ? null : studentId || null;

    const feedback = await Feedback.create({
      referenceNumber,
      category: data.category,
      submissionMode: data.submissionMode,
      student: linkedStudentId,
      department: data.department || null,
      course: data.course || null,
      subject: data.subject || null,
      faculty: data.faculty || null,
      facility: data.facility || null,
      overallRating: data.overallRating,
      criteriaRatings: data.criteriaRatings || [],
      comments: data.comments,
      suggestions: data.suggestions,
      sentiment,
      tags,
      status: 'submitted',
    });

    // Notify student if identified
    if (studentId && !isAnonymous) {
      await createNotification({
        recipientId: studentId,
        title: 'Feedback Submitted Successfully',
        message: `Your feedback (${referenceNumber}) has been recorded. Thank you for making Suvidha better!`,
        type: 'feedback',
        relatedId: feedback._id.toString(),
        link: `/student/submissions?tab=feedback&ref=${referenceNumber}`,
      });
    }

    // Notify assigned faculty if applicable
    if (data.faculty) {
      await createNotification({
        recipientId: data.faculty,
        title: 'New Student Feedback Received',
        message: `New feedback submitted under ${data.category.replace('_', ' ')}.`,
        type: 'feedback',
        relatedId: feedback._id.toString(),
        link: `/faculty/feedback`,
      });
    }

    await logAuditEvent({
      userId: isAnonymous ? undefined : studentId,
      action: 'FEEDBACK_SUBMITTED',
      category: 'feedback',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      details: {
        referenceNumber,
        category: data.category,
        submissionMode: data.submissionMode,
        rating: data.overallRating,
      },
    });

    return feedback;
  }

  static async getStudentFeedbacks(studentId: string): Promise<IFeedback[]> {
    // Only returns identified feedback submitted by this student
    return await Feedback.find({ student: studentId })
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('subject', 'name code')
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 });
  }

  static async getFacultyFeedback(
    facultyUserId: string,
    minSampleSize: number = 2
  ): Promise<{
    feedbacks: any[];
    averageRating: number;
    totalCount: number;
    sufficientData: boolean;
    ratingBreakdown: Record<number, number>;
  }> {
    const feedbacks = await Feedback.find({ faculty: facultyUserId })
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    const totalCount = feedbacks.length;
    const sufficientData = totalCount >= minSampleSize;

    if (!sufficientData) {
      return {
        feedbacks: [],
        averageRating: 0,
        totalCount,
        sufficientData: false,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    let sum = 0;
    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Sanitize anonymous records to guarantee identity protection
    const sanitizedFeedbacks = feedbacks.map((fb) => {
      sum += fb.overallRating;
      ratingBreakdown[fb.overallRating] = (ratingBreakdown[fb.overallRating] || 0) + 1;

      const obj = fb.toObject();
      if (obj.submissionMode === 'anonymous') {
        delete obj.student;
      }
      return obj;
    });

    const averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 0;

    return {
      feedbacks: sanitizedFeedbacks,
      averageRating,
      totalCount,
      sufficientData: true,
      ratingBreakdown,
    };
  }

  static async getAllFeedbacks(filters: {
    category?: string;
    department?: string;
    status?: string;
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ feedbacks: IFeedback[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, filters.limit || 20);
    const query: any = {};

    if (filters.category) query.category = filters.category;
    if (filters.department) query.department = filters.department;
    if (filters.status) query.status = filters.status;
    if (filters.rating) query.overallRating = filters.rating;

    if (filters.search) {
      query.$or = [
        { referenceNumber: { $regex: filters.search, $options: 'i' } },
        { comments: { $regex: filters.search, $options: 'i' } },
        { facility: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const total = await Feedback.countDocuments(query);
    const rawFeedbacks = await Feedback.find(query)
      .populate('student', 'name email studentId')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('subject', 'name code')
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Ensure that if any record has submissionMode === 'anonymous', student is never returned
    const feedbacks = rawFeedbacks.map((fb) => {
      const doc = fb.toObject() as IFeedback;
      if (doc.submissionMode === 'anonymous') {
        doc.student = undefined;
      }
      return doc;
    });

    return {
      feedbacks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
