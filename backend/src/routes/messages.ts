import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  sendMessage,
  getMessagesByChannel,
  editMessage,
  deleteMessage
} from "../controllers/message.controller";

const router = Router();

// -------------------------
// Send a message (workspace/channel/direct)
// -------------------------
router.post("/", authenticate, sendMessage);

// -------------------------
// Get messages by workspace or channel
// -------------------------
// expects query params: ?workspaceId=...&channelId=...
router.get("/", authenticate, getMessagesByChannel);

// -------------------------
// Edit a message
// -------------------------
router.put("/:messageId", authenticate, editMessage);

// -------------------------
// Delete a message
// -------------------------
router.delete("/:messageId", authenticate, deleteMessage);

export default router;
