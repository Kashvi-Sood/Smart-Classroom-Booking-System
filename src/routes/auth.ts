import express from "express";
import bcrypt from "bcrypt";
import { sign } from "../utils/jwt";
import { User, IUser } from "../models/User";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, userid, email, password, rfidUID, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });
    }

    // Check if user already exists
    const exists = await User.findOne({ email }).exec();
    if (exists) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      userid,
      password: hashed,
      rfidUID: rfidUID || null,
      role: role || "student", // default role is "student"
    });

    // Convert ObjectId properly
    const userId =
      typeof user._id === "string"
        ? user._id
        : (user._id as { toString: () => string }).toString();

    // Generate JWT token
    const token = sign({
      id: userId,
      role: user.role,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        rfidUID: user.rfidUID,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const userId =
      typeof user._id === "string"
        ? user._id
        : (user._id as { toString: () => string }).toString();

    const token = sign({
      id: userId,
      role: user.role,
    });

    return res.json({ token });
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
