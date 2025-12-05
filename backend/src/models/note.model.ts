import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  workspaceId?: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  folder?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folder: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

noteSchema.index({ workspaceId: 1 });
noteSchema.index({ createdBy: 1 });

export const Note = mongoose.model<INote>("Note", noteSchema);
