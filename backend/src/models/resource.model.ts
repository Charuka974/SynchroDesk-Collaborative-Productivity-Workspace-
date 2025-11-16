import mongoose, { Document, Schema } from "mongoose";

export enum ResourceType {
  IMAGE = "IMAGE",
  FILE = "FILE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT"
}

export interface IResource extends Document {
  workspaceId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;

  type: ResourceType;
  url: string;
  size: number; // in bytes
  name: string; // original file name
  extension: string; // jpg, png, pdf, docx, mp3

  // Where is this file used?
  linkedTo?: {
    type: "task" | "note" | "message" | "event";
    refId: mongoose.Types.ObjectId;
  }[];

  // For auditing
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: Object.values(ResourceType),
      required: true,
    },

    url: { type: String, required: true },
    size: { type: Number, required: true },
    name: { type: String, required: true },
    extension: { type: String, required: true },

    linkedTo: [
      {
        type: {
          type: String,
          enum: ["task", "note", "message", "event"],
        },
        refId: { type: Schema.Types.ObjectId },
      },
    ],
  },
  { timestamps: true }
);

resourceSchema.index({ workspaceId: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ "linkedTo.refId": 1 });

export const Resource = mongoose.model<IResource>("Resource", resourceSchema);
