import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  content: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, max: 500, min: 0 },
    content: { type: String, required: true },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>("Course", courseSchema);
