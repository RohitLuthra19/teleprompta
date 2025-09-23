import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import profileRouter from "./routes/user";

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
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Auth routes
// Versioning added: /api/v1/auth
app.use("/api/v1/auth", authRouter);

// Protected route example
// req.user is added by authMiddleware
app.use("/api/v1/profile", profileRouter);

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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

export default app;
