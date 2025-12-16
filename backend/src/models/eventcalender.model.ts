import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  workspaceId?: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  start: Date;
  end: Date;
  description?: string;
  eventType?: string;
  location?: string;
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;              // every N units (default: 1)
    daysOfWeek?: number[];          // 0 = Sun, 6 = Sat (for weekly)
    until?: Date;                   // stop repeating
    count?: number;                 // OR stop after N occurrences
    exceptions?: Date[];            // skipped dates
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    description: String,
    eventType: String,
    location: String,
    recurrence: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      interval: {
        type: Number,
        default: 1,
        min: 1,
      },
      daysOfWeek: {
        type: [Number], // 0–6
        validate: {
          validator: (arr: number[]) =>
            arr.every((d) => d >= 0 && d <= 6),
          message: "daysOfWeek must be between 0 and 6",
        },
      },
      until: Date,
      count: Number,
      exceptions: [Date],
    },
  },
  { timestamps: true }
);

eventSchema.index({ workspaceId: 1, start: 1 });

export const Event = mongoose.model<IEvent>("Event", eventSchema);
