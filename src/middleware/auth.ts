import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev_secret";

declare global { namespace Express { interface Request { user?: any } } }

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: "Missing auth" });
  const token = h.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET) as any;
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Missing user" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}
