import mongoose, { Document, Schema } from "mongoose";

export enum SubscriptionPlan {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
}

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String },
    plan: { type: String, enum: Object.values(SubscriptionPlan), default: SubscriptionPlan.FREE },
    status: { type: String, required: true },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);
