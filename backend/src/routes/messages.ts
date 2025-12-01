import express from "express";
import { authenticate } from "../middleware/auth";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller";

const router = express.Router();

router.get("/users", authenticate, getUsersForSidebar);
router.get("/:id", authenticate, getMessages);

router.post("/send/:id", authenticate, sendMessage);

export default router;