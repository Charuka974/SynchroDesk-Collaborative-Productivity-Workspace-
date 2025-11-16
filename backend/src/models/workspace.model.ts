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

  invitedUsers?: mongoose.Types.ObjectId[];
  isArchived?: boolean;

  settings?: {
    theme: "light" | "dark";
    allowUploads: boolean;
    notifications: boolean;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    description: String,

    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: Object.values(WorkspaceRole),
          default: WorkspaceRole.MEMBER,
        },
      },
    ],

    invitedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],

    settings: {
      theme: { type: String, default: "light" },
      allowUploads: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ "members.userId": 1 });

export const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);
