import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectMongo } from "../src/config/mongo";
import { User } from "../src/models/User";

dotenv.config();

async function main() {
  await connectMongo();

  const email = process.env.ADMIN_EMAIL!;
  const pass = process.env.ADMIN_PASSWORD!;

  if (!email || !pass) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("admin exists");
    process.exit(0);
  }

  const hash = await bcrypt.hash(pass, 10);

  await User.create({
    name: "Admin",
    email,
    password: hash,
    role: "admin",
  });

  console.log("Admin created", email);
  process.exit(0);
}

main();
