import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBookingHistory extends Document {
  classroom: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  bookedBy: mongoose.Types.ObjectId;
  bookingType: string;
  attendees: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const BookingHistorySchema = new Schema<IBookingHistory>({
  classroom: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
  startTime: Date,
  endTime: Date,
  bookedBy: { type: Schema.Types.ObjectId, ref: "User" },
  bookingType: String,
  attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: () => new Date() }
});

export const BookingHistory: Model<IBookingHistory> = mongoose.models.BookingHistory || mongoose.model<IBookingHistory>("BookingHistory", BookingHistorySchema);
