// ...existing code...
import mqtt from "mqtt";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { User, IUser } from "../models/User";
import { Classroom, IClassroom } from "../models/Classroom";
import { ActiveBooking, IActiveBooking } from "../models/ActiveBooking";

dotenv.config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";

const client = mqtt.connect(MQTT_BROKER_URL);

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  client.subscribe("classroom/+/rfid", (err) => {
    if (!err) {
      console.log("📡 Subscribed to classroom RFID topics");
    } else {
      console.error("❌ MQTT subscribe error:", err);
    }
  });
});

client.on("message", async (topic, message) => {
  try {
    const parts = topic.split("/");
    if (parts.length < 3) {
      console.warn("⚠️ Received malformed topic:", topic);
      return;
    }
    const classroomId = parts[1]; // topic: classroom/<id>/rfid
    const rfidUID = message.toString().trim();

    console.log(`📶 RFID scan detected in classroom ${classroomId}: ${rfidUID}`);

    // Find the user associated with this RFID
    const user = (await User.findOne({ rfidUID }).exec()) as (mongoose.Document & IUser) | null;
    if (!user) {
      console.warn(`⚠️ Unrecognized RFID UID: ${rfidUID}`);
      return;
    }

    // Find classroom
    const classroom = (await Classroom.findById(classroomId).exec()) as (mongoose.Document & IClassroom) | null;
    if (!classroom) {
      console.warn(`⚠️ Classroom not found: ${classroomId}`);
      return;
    }

    // Find any active booking for this classroom
    const booking = (await ActiveBooking.findOne({
      classroomId: classroom._id,
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    }).exec()) as (mongoose.Document & IActiveBooking & { attendees?: mongoose.Types.ObjectId[] }) | null;

    if (!booking) {
      console.warn(`❌ No active booking found for classroom ${classroomId}`);
      return;
    }

    // Ensure attendees array exists
    if (!Array.isArray(booking.attendees)) {
      booking.attendees = [];
    }

    // Prevent duplicate attendees (use equals if ObjectId)
    const alreadyCheckedIn = booking.attendees.some((a: any) =>
      (a && typeof a.equals === "function") ? a.equals(user._id) : String(a) === String(user._id)
    );

    if (!alreadyCheckedIn) {
      booking.attendees.push(user._id as mongoose.Types.ObjectId);
      await booking.save();
      const classroomNumber = classroom.classroomID ?? classroom._id;
      console.log(`✅ ${user.name} checked in to classroom ${classroomNumber}`);
    } else {
      console.log(`ℹ️ ${user.name} already checked in.`);
    }

    // If user is a teacher — mark class as started
    if ((user as any).role === "teacher" && !booking.sessionStarted) {
      booking.sessionStarted = true;
      await booking.save();
      console.log(`🎓 Class session started by ${user.name}`);

      // Example: Turn ON relay via MQTT
      const relayTopic = `classroom/${classroomId}/relay`;
      client.publish(relayTopic, "ON", { qos: 1 }, (err) => {
        if (err) console.error("🔌 Failed to publish relay ON:", err);
        else console.log("🔌 Relay ON (class started)");
      });
    }
  } catch (err) {
    console.error("💥 Error handling MQTT message:", err);
  }
});

export default client;
// ...existing code...