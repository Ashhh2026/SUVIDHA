import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'feedback' | 'grievance' | 'announcement' | 'system';
  relatedId?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['feedback', 'grievance', 'announcement', 'system'],
      default: 'system',
      index: true,
    },
    relatedId: { type: String },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

export const Notification = (mongoose.models.Notification as mongoose.Model<INotification>) || mongoose.model<INotification>('Notification', NotificationSchema);
