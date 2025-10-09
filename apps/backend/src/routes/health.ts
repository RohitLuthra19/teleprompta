import { Request, Response, Router } from "express";
import prisma from "../prisma.js";

const router = Router();
// Health check route with database connectivity validation
router.get("/", async (_req: Request, res: Response) => {
  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    config: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      port: process.env.PORT || 3000,
    },
    database: {
      status: "unknown",
      latency: null as number | null,
      error: null as string | null,
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  try {
    const startTime = Date.now();
    
    // Test database connectivity with a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    const endTime = Date.now();
    healthCheck.database.status = "connected";
    healthCheck.database.latency = endTime - startTime;
  } catch (error) {
    healthCheck.status = "error";
    healthCheck.database.status = "disconnected";
    healthCheck.database.error = error instanceof Error ? error.message : "Unknown database error";
    
    // Return 503 Service Unavailable if database is down
    return res.status(503).json(healthCheck);
  }

  res.json(healthCheck);
});

export default router;
