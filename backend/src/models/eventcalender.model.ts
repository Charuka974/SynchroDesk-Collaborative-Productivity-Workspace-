import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  workspaceId?: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  onlineMeetingLink?: string;
  attendees?: mongoose.Types.ObjectId[];
  reminders?: number[]; // minutes before
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    description: String,
    location: String,
    onlineMeetingLink: String,
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reminders: [{ type: Number }],
  },
  { timestamps: true }
);

eventSchema.index({ workspaceId: 1, start: 1 });

export const Event = mongoose.model<IEvent>("Event", eventSchema);
