import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  start: Date;
  end: Date;
  description?: string;
  attendees?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    description: String,
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
