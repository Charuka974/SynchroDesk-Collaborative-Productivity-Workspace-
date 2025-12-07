// ✔ getMyNotifications()
// ✔ markAsRead()
// ✔ markAllAsRead()
// ✔ deleteNotification()

import { Request, Response } from "express";
import mongoose from "mongoose";
import { AUthRequest } from "../middleware/auth";
import { Notification, NotificationType } from "../models/notification.model";

// ================================================================
// CREATE NOTIFICATION (internal use only)
// ================================================================

export const createNotification = async (data: {
  userId: mongoose.Types.ObjectId | string;
  workspaceId?: string | null;
  type: NotificationType;
  message: string;
  link?: string;
}) => {
  try {
    const notification = await Notification.create({
      userId: data.userId,
      workspaceId: data.workspaceId || null,
      type: data.type,
      message: data.message,
      link: data.link || null,
    });

    // OPTIONAL: Emit socket to the user
    // io.to(data.userId).emit("notification:new", notification);

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

// ================================================================
// GET MY NOTIFICATIONS
// ================================================================

export const getMyNotifications = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

// ================================================================
// GET UNREAD COUNT
// ================================================================

export const getUnreadCount = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const count = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.status(200).json({ unread: count });
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    res.status(500).json({ message: "Server error fetching unread count" });
  }
};

// ================================================================
// MARK NOTIFICATION AS READ
// ================================================================

export const markAsRead = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;

    const notif = await Notification.findOne({
      _id: id,
      userId,
    });

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notif.read = true;
    await notif.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ message: "Server error updating notification" });
  }
};

// ================================================================
// MARK ALL AS READ
// ================================================================

export const markAllAsRead = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Server error marking all notifications" });
  }
};

// ================================================================
// DELETE NOTIFICATION
// ================================================================

export const deleteNotification = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.sub;

    const notif = await Notification.findOne({ _id: id, userId });

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notif.deleteOne();

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error deleting notification" });
  }
};
