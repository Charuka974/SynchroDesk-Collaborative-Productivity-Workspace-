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

// Workspace CRUD
router.post("/", authenticate, createWorkspace);
router.get("/mine", authenticate, getMyWorkspaces);
router.get("/:id", authenticate, getWorkspace);
router.put("/:id", authenticate, updateWorkspace);
router.delete("/:id", authenticate, deleteWorkspace);

// Members
router.post("/:id/members", authenticate, inviteMember);
router.delete("/:id/members/:userId", authenticate, removeMember);

export default router;
 