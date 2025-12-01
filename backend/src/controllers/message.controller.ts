import { Response } from "express";
import Message, { IMessage } from "../models/message.model";
import { User } from "../models/user.model";
import { AUthRequest } from "../middleware/auth";
import cloudinary from "../config/cloudinary";
import { getReceiverSocketId, io } from "../lib/socket";

// GET all users except logged-in user
export const getUsersForSidebar = async (req: AUthRequest, res: Response) => {
  try {
    const loggedInUserId = req.user?.sub;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
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

    const messages: IMessage[] = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

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

