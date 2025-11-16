import mongoose, { Document, Schema } from "mongoose";

export enum WorkspaceRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: WorkspaceRole;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: Object.values(WorkspaceRole), default: WorkspaceRole.MEMBER },
      },
    ],
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);
