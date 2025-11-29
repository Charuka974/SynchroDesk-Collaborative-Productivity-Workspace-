import { Router } from "express";
import { authenticate } from "../middleware/auth";

import {
  getMyProfile,
  getAllUsers,
  getUsersInMyWorkspaces,
  updateProfile,
  changePassword
} from "../controllers/user.controller";

const router = Router();

router.get("/me", authenticate, getMyProfile);
router.get("/", authenticate, getAllUsers);
router.get("/workspace-users", authenticate, getUsersInMyWorkspaces);

router.put("/me", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);

export default router;
