import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  action: string;
  category: 'auth' | 'grievance' | 'feedback' | 'admin' | 'security';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['auth', 'grievance', 'feedback', 'admin', 'security'],
      required: true,
      index: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditLog = (mongoose.models.AuditLog as mongoose.Model<IAuditLog>) || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
