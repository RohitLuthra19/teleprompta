import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretkey",
);

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    req.user = payload as { userId: string; email: string };
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
