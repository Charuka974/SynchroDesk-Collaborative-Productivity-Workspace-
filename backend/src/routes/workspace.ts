import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createWorkspace,
  inviteMember,
  removeMember,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace
} from "../controllers/workspace.controller";

const router = Router();

// ─────────────────────────────
// WORKSPACE CRUD ROUTES
// ─────────────────────────────
router.post("/", authenticate, createWorkspace);
router.get("/mine", authenticate, getMyWorkspaces);
router.get("/:id", authenticate, getWorkspace);
router.put("/:id", authenticate, updateWorkspace);
router.delete("/:id", authenticate, deleteWorkspace);

// ─────────────────────────────
// MEMBER MANAGEMENT ROUTES
// ─────────────────────────────
router.post("/:id/invite", authenticate, inviteMember);
router.delete("/:id/remove/:userId", authenticate, removeMember);

export default router;
