import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createWorkspace,
  inviteMember,
  removeMember,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace, 
  deleteWorkspace,
  changeWorkspaceRole,
  leaveWorkspace
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
router.patch("/:id/role", authenticate, changeWorkspaceRole);
router.delete("/:id/leave", authenticate, leaveWorkspace);



export default router;
