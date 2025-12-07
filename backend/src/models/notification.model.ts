import mongoose, { Document, Schema } from "mongoose";

export enum NotificationType {
  TASK = "TASK",
  MESSAGE = "MESSAGE",
  EVENT = "EVENT",
  SYSTEM = "SYSTEM",
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  link?: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>( 
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
