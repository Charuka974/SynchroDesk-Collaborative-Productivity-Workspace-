import { Response } from "express";
import Message, { IMessage } from "../models/message.model";
import { User } from "../models/user.model";
import { AUthRequest } from "../middleware/auth"; 
import { getReceiverSocketId, io } from "../lib/socket";
import { Workspace } from "../models/workspace.model";
import { uploadImage } from "../utils/cloudinary";

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
    const senderId = req.user?.sub;
    const receiverId = req.params.id;
    const { text } = req.body;

    const files = req.files as {
      image?: Express.Multer.File[];
      file?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    };

    let imageUrl: string | undefined;
    let fileUrl: string | undefined;
    let audioUrl: string | undefined;

    // Upload image
    if (files?.image?.[0]) {
      imageUrl = await uploadImage(files.image[0].buffer, "chat/images");
    }

    // Upload file (PDF, docs, etc)
    if (files?.file?.[0]) {
      fileUrl = await uploadImage(files.file[0].buffer, "chat/files");
    }

    // Upload audio
    if (files?.audio?.[0]) {
      audioUrl = await uploadImage(files.audio[0].buffer, "chat/audio");
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file: fileUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    // Emit to users
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    const senderSocketId = getReceiverSocketId(senderId!);
    if (senderSocketId && senderSocketId !== receiverSocketId)
      io.to(senderSocketId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);

  } catch (error: any) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const sendGroupMessage = async (req: AUthRequest, res: Response) => {
  try {
    const senderId = req.user?.sub;
    const workspaceId = req.params.id;
    const { text } = req.body;

    const files = req.files as {
      image?: Express.Multer.File[];
      file?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    };

    let imageUrl: string | undefined;
    let fileUrl: string | undefined;
    let audioUrl: string | undefined;

    if (files?.image?.[0]) {
      imageUrl = await uploadImage(files.image[0].buffer, "chat/images");
    }

    if (files?.file?.[0]) {
      fileUrl = await uploadImage(files.file[0].buffer, "chat/files");
    }

    if (files?.audio?.[0]) {
      audioUrl = await uploadImage(files.audio[0].buffer, "chat/audio");
    }

    const newMessage = new Message({
      senderId,
      workspaceId,
      text,
      image: imageUrl,
      file: fileUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    // Emit to workspace channel
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

