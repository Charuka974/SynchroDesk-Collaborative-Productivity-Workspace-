import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

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

// ADD MULTER HERE
router.post("/me", authenticate, upload.single("avatar"), updateProfile);

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
