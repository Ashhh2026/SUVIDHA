import mongoose, { Document, Schema } from 'mongoose';

export type GrievanceCategory =
  | 'academic'
  | 'administrative'
  | 'facilities'
  | 'examination'
  | 'harassment_misconduct'
  | 'technical'
  | 'other';

export type GrievancePriority = 'low' | 'medium' | 'high' | 'critical';

export type GrievanceStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_student_info'
  | 'resolved'
  | 'closed'
  | 'reopened';

export interface IGrievanceAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export interface IGrievance extends Document {
  referenceNumber: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  priority: GrievancePriority;
  isSensitive: boolean; // harassment, misconduct
  submissionMode: 'identified' | 'anonymous';
  student?: mongoose.Types.ObjectId; // null if anonymous
  anonymousTrackingTokenHash?: string; // SHA-256 hash for anonymous progress tracking
  department?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId; // Faculty/Coordinator/Admin
  assignedBy?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  status: GrievanceStatus;
  incidentDate?: Date;
  location?: string;
  targetResolutionDate?: Date; // SLA
  resolvedAt?: Date;
  closedAt?: Date;
  resolutionSummary?: string;
  reopenReason?: string;
  attachments: IGrievanceAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const GrievanceSchema = new Schema<IGrievance>(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'academic',
        'administrative',
        'facilities',
        'examination',
        'harassment_misconduct',
        'technical',
        'other',
      ],
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    isSensitive: { type: Boolean, default: false, index: true },
    submissionMode: {
      type: String,
      required: true,
      enum: ['identified', 'anonymous'],
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    anonymousTrackingTokenHash: {
      type: String,
      index: true,
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    status: {
      type: String,
      required: true,
      enum: [
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'awaiting_student_info',
        'resolved',
        'closed',
        'reopened',
      ],
      default: 'submitted',
      index: true,
    },
    incidentDate: { type: Date },
    location: { type: String, trim: true },
    targetResolutionDate: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    resolutionSummary: { type: String, trim: true },
    reopenReason: { type: String, trim: true },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, required: true },
        fileType: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Grievance = (mongoose.models.Grievance as mongoose.Model<IGrievance>) || mongoose.model<IGrievance>('Grievance', GrievanceSchema);
