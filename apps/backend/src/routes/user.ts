import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/profile
router.get("/", authMiddleware, (req: Request, res: Response) => {
  // If you have global type merge for req.user, you don't need a cast
  const user = (req as any).user; // remove cast if using global type
  res.json({ message: "Welcome!", user });
});

export default router;
