import mongoose, { Document, Schema } from 'mongoose';

export interface IPeerReviewRatings {
  teamwork: number;
  communication: number;
  problemSolving: number;
  punctuality: number;
  overall: number;
}

export interface IPeerReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  semester: number;
  academicYear: string;
  ratings: IPeerReviewRatings;
  strengths: string[];
  areasForImprovement?: string;
  comments?: string;
  isAnonymous: boolean;
  status: 'active' | 'flagged' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const PeerReviewSchema = new Schema<IPeerReview>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, default: '2025-2026', trim: true },
    ratings: {
      teamwork: { type: Number, required: true, min: 1, max: 5 },
      communication: { type: Number, required: true, min: 1, max: 5 },
      problemSolving: { type: Number, required: true, min: 1, max: 5 },
      punctuality: { type: Number, required: true, min: 1, max: 5 },
      overall: { type: Number, required: true, min: 1, max: 5 },
    },
    strengths: [{ type: String, trim: true }],
    areasForImprovement: { type: String, trim: true, maxlength: 1000 },
    comments: { type: String, trim: true, maxlength: 1500 },
    isAnonymous: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['active', 'flagged', 'hidden'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews for the same peer in the same semester and academic year
PeerReviewSchema.index(
  { reviewer: 1, reviewee: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

export const PeerReview = (mongoose.models.PeerReview as mongoose.Model<IPeerReview>) || mongoose.model<IPeerReview>('PeerReview', PeerReviewSchema);
