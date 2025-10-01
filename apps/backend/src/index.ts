import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";
import scriptRouter from "./routes/script.js";
import profileRouter from "./routes/user.js";

// -------------------
// App Initialization
// -------------------
const app = express();
const PORT = process.env.PORT || 3000;

// -------------------
// Middlewares
// -------------------

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// -------------------
// API Routes
// -------------------

// Health check route
app.use("/api/health", healthRouter);

// Auth routes
// Versioning added: /api/v1/auth
app.use("/api/v1/auth", authRouter);

// Protected route example
// req.user is added by authMiddleware
app.use("/api/v1/profile", profileRouter);

// Script routes
app.use("/api/v1/scripts", scriptRouter);

// -------------------
// Global Error Handler
// -------------------
// Catches all errors and returns 500 JSON response
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// -------------------
// Start Server
// -------------------
const isDirectRun = (() => {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    return path.resolve(process.argv[1] || "") === currentFile;
  } catch (_e) {
    return false;
  }
})();

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

export default app;
