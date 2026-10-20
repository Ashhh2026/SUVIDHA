import mongoose, { Document, Schema } from 'mongoose';

export type FeedbackCategory =
  | 'course_curriculum'
  | 'faculty_teaching'
  | 'infrastructure_facilities'
  | 'library_laboratory'
  | 'hostel_mess'
  | 'campus_cleanliness'
  | 'transport_parking'
  | 'it_services'
  | 'general_suggestions'
  | 'other';

export type SubmissionMode = 'identified' | 'anonymous';

export interface IFeedbackCriteria {
  label: string;
  score: number; // 1 to 5
}

export interface IFeedback extends Document {
  referenceNumber: string;
  category: FeedbackCategory;
  submissionMode: SubmissionMode;
  student?: mongoose.Types.ObjectId; // MUST BE NULL for anonymous feedback
  department?: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  faculty?: mongoose.Types.ObjectId;
  facility?: string;
  overallRating: number; // 1 to 5
  criteriaRatings: IFeedbackCriteria[];
  comments: string;
  suggestions?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags: string[];
  status: 'submitted' | 'reviewed' | 'addressed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
      index: true,
    },
    submissionMode: {
      type: String,
      required: true,
      enum: ['identified', 'anonymous'],
      index: true,
    },
    // Intentionally unlinked if submissionMode === 'anonymous'
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', index: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    facility: { type: String, trim: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    criteriaRatings: [
      {
        label: { type: String, required: true },
        score: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    comments: { type: String, required: true, trim: true },
    suggestions: { type: String, trim: true },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'addressed'],
      default: 'submitted',
      index: true,
    },
    adminNotes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Feedback = (mongoose.models.Feedback as mongoose.Model<IFeedback>) || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
