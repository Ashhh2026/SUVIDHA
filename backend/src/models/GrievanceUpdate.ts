import mongoose, { Document, Schema } from 'mongoose';

export type UpdateType =
  | 'status_change'
  | 'official_response'
  | 'student_reply'
  | 'internal_note'
  | 'assignment'
  | 'escalation';

export interface IGrievanceUpdate extends Document {
  grievance: mongoose.Types.ObjectId;
  author?: mongoose.Types.ObjectId; // null if anonymous student
  authorRole: 'student' | 'faculty' | 'coordinator' | 'admin' | 'anonymous_student';
  authorName?: string; // e.g. "Dr. R. Sharma (Faculty)" or "Student (Anonymous)"
  updateType: UpdateType;
  message: string;
  previousStatus?: string;
  newStatus?: string;
  isInternalOnly: boolean; // if true, visible only to faculty/coordinator/admin
  createdAt: Date;
  updatedAt: Date;
}

const GrievanceUpdateSchema = new Schema<IGrievanceUpdate>(
  {
    grievance: {
      type: Schema.Types.ObjectId,
      ref: 'Grievance',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    authorRole: {
      type: String,
      required: true,
      enum: ['student', 'faculty', 'coordinator', 'admin', 'anonymous_student'],
    },
    authorName: {
      type: String,
    },
    updateType: {
      type: String,
      required: true,
      enum: [
        'status_change',
        'official_response',
        'student_reply',
        'internal_note',
        'assignment',
        'escalation',
      ],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    previousStatus: { type: String },
    newStatus: { type: String },
    isInternalOnly: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const GrievanceUpdate =
  (mongoose.models.GrievanceUpdate as mongoose.Model<IGrievanceUpdate>) ||
  mongoose.model<IGrievanceUpdate>('GrievanceUpdate', GrievanceUpdateSchema);
