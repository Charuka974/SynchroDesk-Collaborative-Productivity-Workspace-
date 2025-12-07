 import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notification.controller";

const router = Router();

// ─────────────────────────────
// NOTIFICATION ROUTES
// ─────────────────────────────

// Get all notifications of logged-in user
router.get("/", authenticate, getMyNotifications);

// Get unread notifications count
router.get("/unread/count", authenticate, getUnreadCount);

// Mark a single notification as read
router.put("/read/:id", authenticate, markAsRead);

// Mark all notifications as read
router.put("/read-all", authenticate, markAllAsRead);

// Delete a notification
router.delete("/:id", authenticate, deleteNotification);

export default router;
