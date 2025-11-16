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
  workspaceId?: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  priority: TaskPriority;
  tags?: string[];
  dueDate?: Date;
  status: TaskStatus;

  subtasks?: {
    title: string;
    completed: boolean;
  }[];

  attachments?: {
    resourceId: mongoose.Types.ObjectId; // linking to Resource model
  }[];

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
    description: String,

    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },

    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },

    tags: [{ type: String }],
    dueDate: Date,

    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },

    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false },
      },
    ],

    attachments: [
      {
        resourceId: { type: Schema.Types.ObjectId, ref: "Resource" },
      },
    ],

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

taskSchema.index({ workspaceId: 1 });
taskSchema.index({ assignedTo: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
