import { Router } from "express";
import { Classroom } from "../models/Classroom";
import { authMiddleware, adminOnly } from "../middleware/auth";

const router = Router();

// add classroom (admin)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const c = await Classroom.create(req.body);
  res.status(201).json(c);
});

// delete classroom
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  await Classroom.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// list classrooms
router.get("/", authMiddleware, async (req, res) => {
  const list = await Classroom.find();
  res.json(list);
});

export default router;
