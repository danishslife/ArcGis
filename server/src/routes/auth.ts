import type { Request, Response } from "express";
import express from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { z } from "zod";
import { env } from "../config/env.js";
import { validateBody } from "../middleware/schemaValidator.js";
import { getAuthUser, requireAuth } from "../middleware/requireAuth.js";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address")),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address")),
  password: z.string().min(1, "Password is required"),
});

const router = express.Router();

function signToken(userId: string) {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

// Register User

router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    try {
      const user = new User({ firstName, lastName, email, password });
      await user.save();

      res.status(201).json({
        token: signToken(String(user._id)),
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        res.status(409).json({ message: "Email is already registered" });
        return;
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      res.json({
        token: signToken(String(user._id)),
        user: {
          _id: user._id,
          email: user.email,
          lastName: user.lastName,
          firstName: user.firstName,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.get("/me", requireAuth, (_req: Request, res: Response) => {
  const user = getAuthUser(res);
  res.json({
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});

export default router;
