import express from "express";
import { authenticate } from "../middleware/auth";
import { getGroupMessages, getMessages, getUsersForSidebar, sendGroupMessage, sendMessage } from "../controllers/message.controller";

const router = express.Router();

router.get("/users", authenticate, getUsersForSidebar);

// router.get("/:id", authenticate, getMessages);
router.get("/dm/:id", authenticate, getMessages);
router.get("/group/:id", authenticate, getGroupMessages);

// router.post("/send/:id", authenticate, sendMessage);
router.post("/send/dm/:id", authenticate, sendMessage);
router.post("/send/group/:id", authenticate, sendGroupMessage);

export default router;