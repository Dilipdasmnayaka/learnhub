import mongoose, { Document, Schema } from "mongoose";

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  paymentMethod: "upi" | "credit_card" | "net_banking" | "qr_code";
  paymentStatus: "pending" | "completed" | "failed";
  amountPaid: number;
  transactionId: string;
  enrolledAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    paymentMethod: {
      type: String,
      enum: ["upi", "credit_card", "net_banking", "qr_code"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    amountPaid: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);
