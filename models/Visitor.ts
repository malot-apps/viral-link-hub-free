import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitorDocument extends Document {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isPremium?: boolean;
  ip: string;
  userAgent?: string;
  lastActiveAt: Date;
  viewsCount: number;
  adClicksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema: Schema = new Schema(
  {
    telegramUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      default: '',
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'TelegramMiniApp/1.0',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    adClicksCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

VisitorSchema.index({ lastActiveAt: -1 });

export const Visitor =
  mongoose.models.Visitor || mongoose.model<IVisitorDocument>('Visitor', VisitorSchema);

export default Visitor;
