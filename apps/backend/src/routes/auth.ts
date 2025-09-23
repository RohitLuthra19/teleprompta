import { Router, Request, Response } from "express";
import * as argon2 from "argon2";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretkey",
);

interface AuthRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// ------------------- Signup -------------------
router.post("/signup", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ------------------- Login -------------------
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ------------------- Logout -------------------
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logout successful (delete token client-side)" });
});

export default router;
