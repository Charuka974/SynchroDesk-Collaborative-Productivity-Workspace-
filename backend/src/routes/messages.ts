import express from "express";
import { authenticate } from "../middleware/auth";
import { getGroupMessages, getMessages, getUsersForSidebar, sendGroupMessage, sendMessage } from "../controllers/message.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/users", authenticate, getUsersForSidebar);

// router.get("/:id", authenticate, getMessages);
router.get("/dm/:id", authenticate, getMessages);
router.get("/group/:id", authenticate, getGroupMessages);

// router.post("/send/:id", authenticate, sendMessage);
router.post(
  "/send/dm/:id",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  sendMessage
);

router.post(
  "/send/group/:id",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  sendGroupMessage
);

export default router; 