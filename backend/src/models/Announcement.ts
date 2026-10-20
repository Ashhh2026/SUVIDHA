import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  category: 'general' | 'academic' | 'maintenance' | 'event';
  targetDepartment?: mongoose.Types.ObjectId;
  targetRole: 'all' | 'student' | 'faculty';
  author: mongoose.Types.ObjectId;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal',
      index: true,
    },
    category: {
      type: String,
      enum: ['general', 'academic', 'maintenance', 'event'],
      default: 'general',
    },
    targetDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    targetRole: {
      type: String,
      enum: ['all', 'student', 'faculty'],
      default: 'all',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Announcement = (mongoose.models.Announcement as mongoose.Model<IAnnouncement>) || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
