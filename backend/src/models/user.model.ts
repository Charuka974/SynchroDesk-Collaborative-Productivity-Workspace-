import mongoose, { Document, Schema } from "mongoose"

export enum Role {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  MEMBER = "MEMBER"
}

export enum Status {
  NONE = "NONE",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface IUSER extends Document {
  _id: mongoose.Types.ObjectId;        // Mongoose auto-generates this
  name: string;                   // required
  email: string;                       // required
  password: string;                    // hashed password
  roles: Role[];                           // ADMIN | OWNER | MEMBER (simplified to single role)
  approved: Status;                     // NONE | PENDING | APPROVED | REJECTED
  workspaceIds?: mongoose.Types.ObjectId[]; // Workspaces user belongs to
  avatar?: string;                       // optional profile picture URL
  lastLogin?: Date;                      // last login timestamp
  resetPasswordToken?: string;           // for password reset
  resetPasswordExpires?: Date;           // password reset token expiration
  subscriptionPlan?: "FREE" | "PREMIUM"; // for Stripe / paid features
  createdAt?: Date;                      // auto-added by timestamps
  updatedAt?: Date;                      // auto-added by timestamps
}

const userSchema = new Schema<IUSER>(
  {
    email: { type: String, unique: true, lowercase: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    roles: { type: [String], enum: Object.values(Role), default: [Role.MEMBER] },
    approved: { type: String, enum: Object.values(Status), default: Status.NONE },
    workspaceIds: [{ type: Schema.Types.ObjectId, ref: 'Workspace' }],
    avatar: { type: String },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    subscriptionPlan: { type: String, enum: ['FREE', 'PREMIUM'], default: 'FREE' }
  },
  { timestamps: true }
);


export const User = mongoose.model<IUSER>("User", userSchema)
