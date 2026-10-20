import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: mongoose.Types.ObjectId;
  coordinator?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, trim: true },
    headOfDepartment: { type: Schema.Types.ObjectId, ref: 'User' },
    coordinator: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Department = (mongoose.models.Department as mongoose.Model<IDepartment>) || mongoose.model<IDepartment>('Department', DepartmentSchema);
