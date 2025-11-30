import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { askAI } from "../controllers/aiassistant.controller";

const router = Router();

// POST /api/ai/ask
router.post("/ask", authenticate, askAI);

export default router;
