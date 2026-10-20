import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'student' | 'faculty' | 'coordinator' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  facultyId?: string;
  department?: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  semester?: number;
  phone?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isActive: boolean;
  lastLogin?: Date;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'faculty', 'coordinator', 'admin'],
      default: 'student',
      index: true,
    },
    studentId: { type: String, trim: true, index: true },
    facultyId: { type: String, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    semester: { type: Number, min: 1, max: 12 },
    phone: { type: String, trim: true },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    refreshTokenHash: { type: String },
  },
  {
    timestamps: true,
  }
);

// Do not return password or tokens in toJSON transformations
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.refreshTokenHash;
  return obj;
};

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
