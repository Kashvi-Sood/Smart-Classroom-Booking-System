import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongo } from "./config/mongo";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import classroomsRoutes from "./routes/classrooms";
import bookingsRoutes from "./routes/bookings";
//import "./mqtt/mqttHandler";

dotenv.config();

async function start() {
  await connectMongo();
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_,res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes); // admin only endpoints to manage users
  app.use("/api/classrooms", classroomsRoutes);
  app.use("/api/bookings", bookingsRoutes);

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`🚀 Server listening ${port}`));
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
