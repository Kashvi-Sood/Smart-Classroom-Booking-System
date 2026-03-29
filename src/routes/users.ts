import { Router } from "express";
import { authMiddleware, adminOnly } from "../middleware/auth";
import { User } from "../models/User";
import bcrypt from "bcryptjs";

const router = Router();

// admin create user
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password, userid, role, rfidUID } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const u = await User.create({ name, email, password: hashed, userid, role, rfidUID });
  res.status(201).json(u);
});

// admin delete user
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
