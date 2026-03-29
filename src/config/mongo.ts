import mongoose from "mongoose";

export async function connectMongo(uri?: string) {
  const mongoUri = uri || process.env.MONGO_URI!;
  if (!mongoUri) throw new Error("MONGO_URI not set");
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}
