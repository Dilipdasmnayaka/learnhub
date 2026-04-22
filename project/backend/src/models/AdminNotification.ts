import mongoose, { Document, Schema } from "mongoose";

export interface IAdminNotification extends Document {
  userId?: mongoose.Types.ObjectId;
  email?: string;
  name?: string;
  message: string;
  createdAt: Date;
  status: "new" | "read";
}

const adminNotificationSchema = new Schema<IAdminNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    name: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read"], default: "new" },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export const AdminNotification = mongoose.model<IAdminNotification>(
  "AdminNotification",
  adminNotificationSchema,
);
