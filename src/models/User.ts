import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  userid: string;
  email?: string;
  role: "student" | "teacher" | "admin" | string;
  rfidUID?: string;
  password: string; // added password to interface
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userid: { type: String, unique: true, required: true },
  email: { type: String, unique: true, sparse: true },
  role: { type: String, default: "student" },
  rfidUID: { type: String, unique: true, sparse: true },
  password: { type: String, required: true }, // added password to schema
});

export const User = mongoose.model<IUser>("User", UserSchema);
