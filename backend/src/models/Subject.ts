import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  semester: number;
  faculty: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    faculty: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Subject = (mongoose.models.Subject as mongoose.Model<ISubject>) || mongoose.model<ISubject>('Subject', SubjectSchema);
