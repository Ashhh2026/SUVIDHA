import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  durationYears: number;
  totalSemesters: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    durationYears: { type: Number, default: 4 },
    totalSemesters: { type: Number, default: 8 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Course = (mongoose.models.Course as mongoose.Model<ICourse>) || mongoose.model<ICourse>('Course', CourseSchema);
