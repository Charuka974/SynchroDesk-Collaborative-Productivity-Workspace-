// ✔ sendMessage()
// ✔ getMessagesByChannel()
// ✔ getDirectMessages()

import { Request, Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import { Message, IMessage } from "../models/message.model";
import { Workspace } from "../models/workspace.model";
import { User } from "../models/user.model";
import { AUthRequest } from "../middleware/auth";

// -------------------------
// SEND MESSAGE
// -------------------------
export const sendMessage = async (req: AUthRequest, res: Response) => {
  try {
    const { workspaceId, channelId, receiverId } = req.body;
    const { content, type } = req.body;
    const senderId = req.user?.sub;

    if (!content && type === "text")
      return res.status(400).json({ message: "Message content is required" });

    const message = new Message({
      workspaceId: workspaceId || null,
      channelId: channelId || null,
      senderId,
      receiverId: receiverId || null,
      content,
      type: type || "text",
    });

    await message.save();

    // TODO: emit via socket.io: io.to(workspaceId).emit("message:new", message);

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error sending message" });
  }
};

// -------------------------
// GET MESSAGES BY CHANNEL OR WORKSPACE
// -------------------------
export const getMessagesByChannel = async (req: AUthRequest, res: Response) => {
  try {
    const { workspaceId, channelId } = req.query;

    if (!channelId && !workspaceId)
      return res.status(400).json({ message: "Channel ID or Workspace ID is required" });

    // Build query
    const query: FilterQuery<IMessage> = {};
    if (workspaceId) query.workspaceId = new mongoose.Types.ObjectId(workspaceId as string);
    if (channelId) query.channelId = new mongoose.Types.ObjectId(channelId as string);

    // Fetch messages sorted by createdAt
    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .lean();

    // Populate sender info
    const populated = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.senderId).lean();
        return {
          ...msg,
          id: msg._id.toString(),
          sender: {
            id: sender?._id.toString(),
            name: sender?.name ?? "Unknown",
            email: sender?.email ?? "",
            avatar: sender?.avatar ?? null,
          },
        };
      })
    );

    res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};


// -------------------------
// EDIT MESSAGE
// -------------------------
export const editMessage = async (req: AUthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body; 
    const userId = req.user?.sub;

    if (!content) return res.status(400).json({ message: "Content is required" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== userId)
      return res.status(403).json({ message: "You can only edit your messages" });

    message.content = content;
    message.updatedAt = new Date();
    await message.save();

    // TODO: io.to(message.workspaceId).emit("message:edit", message);

    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error editing message" });
  }
};

// -------------------------
// DELETE MESSAGE
// -------------------------
export const deleteMessage = async (req: AUthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.sub;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== userId)
      return res.status(403).json({ message: "You can only delete your messages" });

    await message.deleteOne();

    // TODO: io.to(message.workspaceId).emit("message:delete", messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting message" });
  }
};


export const getMyWorkspacesForChat = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const workspaces = await Workspace.find({ 
      "members.userId": userId,
    }); // lean() makes them plain objects

    const populatedWorkspaces = await Promise.all(
      workspaces.map(async (ws) => {
        const members = await Promise.all(
          ws.members.map(async (m) => {
            const user = await User.findById(m.userId).lean();
            return {
              id: m.userId.toString(),
              name: user?.name ?? "Unknown",
              email: user?.email ?? "",
              role: m.role,
            };
          })
        );

        return {
          id: ws._id?.toString()??"Invalid Workspace",
          name: ws.name,
          description: ws.description,
          role: ws.members.find(m => m.userId.toString() === userId)?.role ?? "MEMBER",
          members,
        };
      })
    );

    res.status(200).json(populatedWorkspaces);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching workspaces" });
  }
};