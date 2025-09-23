import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../prisma";

const router = Router();

// Interface for TypeScript
interface ScriptRequest extends Request {
  body: {
    title: string;
    description: string;
  };
  params: {
    id: string;
  };
}

// -------------------
// Create a new script
// POST /api/v1/scripts
// -------------------
router.post("/", authMiddleware, async (req: ScriptRequest, res: Response) => {
  try {
    const { title, description } = req.body;

    const script = await prisma.script.create({
      data: { title, description },
    });

    res.status(201).json(script);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create script" });
  }
});

// -------------------
// Get all scripts
// GET /api/v1/scripts
// -------------------
router.get("/", authMiddleware, async (_req, res: Response) => {
  try {
    const scripts = await prisma.script.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(scripts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch scripts" });
  }
});

// -------------------
// Get a single script
// GET /api/v1/scripts/:id
// -------------------
router.get(
  "/:id",
  authMiddleware,
  async (req: ScriptRequest, res: Response) => {
    try {
      const { id } = req.params;
      const script = await prisma.script.findUnique({ where: { id } });
      if (!script) return res.status(404).json({ error: "Script not found" });
      res.json(script);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch script" });
    }
  },
);

// -------------------
// Update a script
// PUT /api/v1/scripts/:id
// -------------------
router.put(
  "/:id",
  authMiddleware,
  async (req: ScriptRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      const updatedScript = await prisma.script.update({
        where: { id },
        data: { title, description },
      });

      res.json(updatedScript);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update script" });
    }
  },
);

// -------------------
// Delete a script
// DELETE /api/v1/scripts/:id
// -------------------
router.delete(
  "/:id",
  authMiddleware,
  async (req: ScriptRequest, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.script.delete({ where: { id } });
      res.json({ message: "Script deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete script" });
    }
  },
);

export default router;
