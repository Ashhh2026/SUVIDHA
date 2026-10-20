import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting =
  (mongoose.models.SystemSetting as mongoose.Model<ISystemSetting>) ||
  mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
