import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import authRouter from "./routes/auth.js";
import savedUniversitiesRouter from "./routes/savedUniversities.js";


export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
      status: connected ? "ok" : "degraded",
      database: connected ? "connected" : "disconnected",
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/saved-universities", savedUniversitiesRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    },
  );

  return app;
}
