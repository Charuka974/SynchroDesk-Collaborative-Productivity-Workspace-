import { Router } from "express";
import { authenticate } from "../middleware/auth";

import {
  getMyProfile,
  getAllUsers,
  getUsersInMyWorkspaces,
  updateProfile,
  changePassword,
  getMyWorkspaceRoles
} from "../controllers/user.controller";

const router = Router();

// ─────────────────────────────
// USER PROFILE ROUTES
// ─────────────────────────────
router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateProfile);
router.put("/me/password", authenticate, changePassword);

// ─────────────────────────────
// USERS LIST ROUTES
// ─────────────────────────────
router.get("/", authenticate, getAllUsers);

// ─────────────────────────────
// WORKSPACE RELATED USERS
// ─────────────────────────────
router.get("/workspace-members", authenticate, getUsersInMyWorkspaces);

router.get("/workspace-my-roles", authenticate, getMyWorkspaceRoles);

export default router;
