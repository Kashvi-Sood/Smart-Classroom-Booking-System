import mongoose from "mongoose";

export enum SessionType {
  BOOKING = "BOOKING",
  SELFSTUDY = "SELFSTUDY",
}

export interface IActiveBooking extends mongoose.Document {
  classroomID: String;
  userid: String;
  startTime: Date;
  endTime: Date;
  attendees: Number;
  sessionType: SessionType;
  sessionStarted: boolean;
}

const ActiveBookingSchema = new mongoose.Schema({
  classroomID: { type: String, required: true },

  userid: { type: String, required: true },

  startTime: { type: Date, required: true },

  endTime: { type: Date, required: true },

  attendees: { type: Number },

  sessionType: { 
    type: String,
    enum: Object.values(SessionType),   // <- "BOOKING", "SELFSTUDY"
    required: true
  },

  sessionStarted: { type: Boolean, default: false },
});

export const ActiveBooking = mongoose.model<IActiveBooking>(
  "ActiveBooking",
  ActiveBookingSchema
);
