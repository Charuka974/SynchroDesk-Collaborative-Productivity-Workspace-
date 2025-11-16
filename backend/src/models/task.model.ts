import mongoose, { Document, Schema } from "mongoose";

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface ITask extends Document {
  title: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  priority: TaskPriority;
  tags?: string[];
  dueDate?: Date;
  status: TaskStatus;
  subtasks?: {
    title: string;
    completed: boolean;
  }[];
  attachments?: string[];
  comments?: {
    userId: mongoose.Types.ObjectId;
    message: string;
    createdAt?: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM },
    tags: [{ type: String }],
    dueDate: { type: Date },
    status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false },
      },
    ],
    attachments: [String],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
