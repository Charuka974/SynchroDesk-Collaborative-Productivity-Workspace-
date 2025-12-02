import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  workspaceId?: mongoose.Types.ObjectId | null;
  senderId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId | null;
  text?: string;
  image?: string;
  file?: string;
  audio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", default: null },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    text: { type: String },
    image: { type: String },
    file: { type: String },
    audio: { type: String },
  }, 
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
