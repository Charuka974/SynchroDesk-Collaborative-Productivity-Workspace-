import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  workspaceId?: mongoose.Types.ObjectId | null;
  channelId?: mongoose.Types.ObjectId | null;

  senderId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId | null;
 
  content?: string;
  type: "text" | "image" | "file" | "audio"; 

  attachments?: {
    resourceId: mongoose.Types.ObjectId;
  }[];

  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", default: null },

    channelId: { type: Schema.Types.ObjectId, ref: "Channel", default: null },

    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    content: { type: String },

    type: {
      type: String,
      enum: ["text", "image", "file", "audio"],
      default: "text",
    },

    attachments: [
      {
        resourceId: { type: Schema.Types.ObjectId, ref: "Resource" },
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ workspaceId: 1 });
messageSchema.index({ channelId: 1 });
messageSchema.index({ senderId: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
