import jwt, { SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { RequestHandler } from "express";

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || "change_this_secret";

interface JWTPayload {
  id?: string;
  role?: string;
  [key: string]: any;
}

export const sign = (payload: JWTPayload, options: SignOptions = {}): string => {
  const defaultOptions: SignOptions = {
    expiresIn: '1h',
    ...options
  };
  
  return jwt.sign(payload, JWT_SECRET, defaultOptions);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export default sign;

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};