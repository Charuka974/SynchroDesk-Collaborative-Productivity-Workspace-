import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  folder?: string;
  versionHistory?: {
    content: string;
    timestamp: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folder: { type: String },
    versionHistory: [
      {
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
