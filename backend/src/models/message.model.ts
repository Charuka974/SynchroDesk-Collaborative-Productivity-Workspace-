import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  workspaceId: mongoose.Types.ObjectId;
  channelId?: string; // null for DM
  senderId: mongoose.Types.ObjectId;
  content: string;
  attachments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    channelId: { type: String, default: null },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    attachments: [String],
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
