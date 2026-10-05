import mongoose, { Schema, Document } from 'mongoose';

export type AuditActionType =
  | 'login'
  | 'logout'
  | 'video_created'
  | 'video_updated'
  | 'video_deleted'
  | 'settings_updated'
  | 'maintenance_changed'
  | 'ad_settings_changed';

export interface IAuditLogDocument extends Document {
  admin: string;
  action: AuditActionType;
  target?: string;
  metadata?: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    admin: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        'login',
        'logout',
        'video_created',
        'video_updated',
        'video_deleted',
        'settings_updated',
        'maintenance_changed',
        'ad_settings_changed',
      ],
    },
    target: {
      type: String,
      default: '',
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'AdminDashboard/1.0',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;
