import { Response } from "express";
import Message, { IMessage } from "../models/message.model";
import { User } from "../models/user.model";
import { AUthRequest } from "../middleware/auth";
import cloudinary from "../config/cloudinary";
import { getReceiverSocketId, io } from "../lib/socket";
import { Workspace } from "../models/workspace.model";

export const getUsersForSidebar = async (req: AUthRequest, res: Response) => {
  try {
    const loggedInUserId = req.user?.sub;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
    const filteredWorkspaces = await Workspace.find({ members: { $elemMatch: { userId: loggedInUserId } } });

    res.status(200).json({
      users: filteredUsers,
      workspaces: filteredWorkspaces
    });
  } catch (error: any) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET messages between logged-in user and another user
export const getMessages = async (req: AUthRequest, res: Response) => {
  try {
    const userToChatId = req.params.id;
    const myId = req.user?.sub;

    // Populate sender info
    const messages: IMessage[] = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name avatar"); // populate sender's name & avatar

    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// POST send a new message
export const sendMessage = async (req: AUthRequest, res: Response) => {
  try {
    const { text, image, file, audio } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user?.sub;

    let imageUrl: string | undefined;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file,
      audio,
    });

    await newMessage.save();

    // Emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Optionally also emit to sender (for consistency)
    const senderSocketId = getReceiverSocketId(senderId!);
    if (senderSocketId && senderSocketId !== receiverSocketId) {
        io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const sendGroupMessage = async (req: AUthRequest, res: Response) => {
  try {
    const { text, image, file, audio } = req.body;
    const workspaceId = req.params.id; // workspace ID from route
    const senderId = req.user?.sub; // authenticated user ID

    if (!workspaceId) {
      return res.status(400).json({ error: "Workspace ID is required" });
    }

    // Optional: handle image upload
    let imageUrl: string | undefined;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create the message document
    const newMessage = new Message({
      senderId,
      workspaceId,
      text,
      image: imageUrl,
      file,
      audio,
    });

    await newMessage.save();

    // Emit message to all users in the workspace
    // Here we assume you have a way to get all user IDs in the workspace
    // For simplicity, you can emit to all connected sockets (adjust if needed)
    io.emit(`workspace-${workspaceId}`, newMessage);

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error("Error in sendGroupMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// GET all messages in a workspace
export const getGroupMessages = async (req: AUthRequest, res: Response) => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user?.sub;

    if (!workspaceId) {
      return res.status(400).json({ error: "Workspace ID is required" });
    }

    // Check membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some(m => m.userId.toString() === userId)) {
      return res.status(403).json({ error: "You are not a member of this workspace" });
    }

    // Fetch messages and populate sender
    const messages: IMessage[] = await Message.find({ workspaceId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name avatar"); // populate sender's name & avatar

    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

