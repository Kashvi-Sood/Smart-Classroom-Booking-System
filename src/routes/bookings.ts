import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { ActiveBooking } from "../models/ActiveBooking";
import { Classroom } from "../models/Classroom";
import { BookingHistory } from "../models/BookingHistory";
import { SessionType } from "../models/ActiveBooking";
import { User } from "../models/User";
import mongoose from "mongoose";

const router = Router();

router.post("/request", authMiddleware, async (req, res) => {
  const { classroomID, startTime, endTime, bookingType, userid } = req.body;

  if (!classroomID || !startTime || !endTime || !bookingType || !userid)
    return res.status(400).json({ error: "Missing" });

  // 1. Find classroom by classroomID (string)
  const classroom = await Classroom.findOne({ classroomID });
  if (!classroom) return res.status(404).json({ error: "No classroom" });

  // 2. Find user by userid (string)
  const user = await User.findOne({ userid });
  if (!user) return res.status(404).json({ error: "User not found" });

  // 3. Check overlap ONLY for teacher/admin
  if (user.role !== "student") {
    const overlap = await ActiveBooking.findOne({
      classroomID: classroomID,    // FIXED — correct field name
      startTime: { $lt: new Date(endTime) },
      endTime:   { $gt: new Date(startTime) }
    });

    if (overlap) {
      return res.status(409).json({
        message: "This classroom is already booked during the selected time slot."
      });
    }
  }

  // 4. Create booking (MUST match schema exactly)
  const b = await ActiveBooking.create({
    classroomID: classroomID,
    userid: userid,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    attendees: 0,                     // FIXED — must match schema (Number)
    sessionType: bookingType,         // FIXED — your schema expects sessionType
    sessionStarted: false
  });

  res.status(201).json(b);
});


  // If selfstudy booking: allow multiple overlapping selfstudy bookings (we will treat them as single ActiveBooking per timeslot)
  // For simplicity: create an ActiveBooking record with bookingType and empty attendees (admin approves)
  /*const b = await ActiveBooking.create({
    classroomID : classroomID,
    userid: (userid),
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    bookedBy: new mongoose.Types.ObjectId(userid),
    sessionType: SessionType.BOOKING,
    attendees: 0,
    status: "pending" // admin flow can be introduced; for now auto approved for example
  });*/
  //URGENT: MAKE SCHEMA FOR ADMIN APPROVAL FLOW LATER

 // res.status(201).json(b);
// admin approve/reject endpoint could be similar: change status and publish MQTT events

// user list available classrooms for a timeslot
router.get("/available", authMiddleware, async (req, res) => {
  const { startTime, endTime } = req.query;
  if (!startTime || !endTime) return res.status(400).json({ error: "Please enter valid Start and End Time." });
  const st = new Date(String(startTime));
  const en = new Date(String(endTime));

  // find classrooms that do not have a conflicting active booking of type teaching/event
  const all = await Classroom.find();
  const results = [];
  for (const c of all) {
    const conflict = await ActiveBooking.findOne({
      classroom: c._id,
      sessionType: SessionType.BOOKING,
      startTime: { $lt: en },
      endTime: { $gt: st }
    });
    if (!conflict) results.push(c);
  }
  res.json(results);
});

export default router;
