import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { DocumentType } from "@typegoose/typegoose";
import { env } from "../config/env.js";
import { User, UserSchema } from "../models/user.js";

export type AuthenticatedUser = DocumentType<UserSchema>;

export function getAuthUser(res: Response): AuthenticatedUser {
  const user = res.locals["user"] as AuthenticatedUser | undefined;

  if (!user) {
    throw new Error("getAuthUser() called on a route without requireAuth");
  }

  return user;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  let payload: string | jwt.JwtPayload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    // Malformed, tampered with, or expired token.
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (typeof payload !== "object" || typeof payload.userId !== "string") {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const user = await User.findById(payload.userId);

    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    res.locals["user"] = user;
    next();
  } catch (error) {
    // A database failure is not an auth failure - let the error handler own it.
    next(error);
  }
}
