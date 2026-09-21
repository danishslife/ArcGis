import type { Request, Response, NextFunction } from "express";
import express from "express";
import { z } from "zod";
import { getAuthUser, requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/schemaValidator.js";
import { SavedUniversity } from "../models/savedUniversity.js";

const saveUniversitySchema = z.object({
  uniId: z.number().int().positive(),
  name: z.string().trim().min(1, "Name is required").max(200),
  address: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "State must be a 2-letter code"),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    })
    .pipe(z.url("Invalid website").optional()),
});

const uniIdParamSchema = z.coerce.number().int().positive();

const PUBLIC_FIELDS = "uniId name address city state website createdAt";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getAuthUser(res);

    const savedUniversities = await SavedUniversity.find({ user: user._id })
      .select(PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ savedUniversities });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  validateBody(saveUniversitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthUser(res);
      const { uniId, ...details } = req.body;

      const result = await SavedUniversity.findOneAndUpdate(
        { user: user._id, uniId },
        { $setOnInsert: details },
        {
          upsert: true,
          new: true,
          runValidators: true,
          projection: PUBLIC_FIELDS,
          includeResultMetadata: true,
          lean: true,
        },
      );

      const created = !result.lastErrorObject?.updatedExisting;

      res.status(created ? 201 : 200).json({ savedUniversity: result.value });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:uniId",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = uniIdParamSchema.safeParse(req.params["uniId"]);

    if (!parsed.success) {
      res.status(400).json({ message: "Invalid university id" });
      return;
    }

    try {
      const user = getAuthUser(res);

      await SavedUniversity.deleteOne({ user: user._id, uniId: parsed.data });

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
