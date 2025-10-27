import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../libs/schema/env.js";
interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authorization.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
