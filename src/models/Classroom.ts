import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClassroom extends Document {
  classroomID: string;
  capacity: number;
  // add other classroom fields here
}

const ClassroomSchema = new Schema<IClassroom>({
  classroomID: { type: String, required: true },
  capacity: { type: Number, required: true },
});

export const Classroom: Model<IClassroom> = mongoose.models.Classroom || mongoose.model<IClassroom>("Classroom", ClassroomSchema);
