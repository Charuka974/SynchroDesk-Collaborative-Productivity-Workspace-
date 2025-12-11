import { Response } from "express";
import Message, { IMessage } from "../models/message.model";
import { User } from "../models/user.model";
import { AUthRequest } from "../middleware/auth"; 
import { getReceiverSocketId, io } from "../index";
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


// -------------------------
// SEND Direct Message
// -------------------------// Properly format messages before sending to frontend
const formatMessage = (msg: any) => {
  const sender = msg.senderId && msg.senderId.name
    ? { _id: msg.senderId._id.toString(), name: msg.senderId.name, avatar: msg.senderId.avatar }
    : { _id: msg.senderId.toString(), name: "Unknown", avatar: "/images/avatar.jpg" };  

  return {
    _id: msg._id.toString(),
    senderId: sender,
    receiverId: msg.receiverId?.toString(),
    workspaceId: msg.workspaceId?.toString(),
    text: msg.text,
    image: msg.image,
    file: msg.file,
    audio: msg.audio,
    createdAt: msg.createdAt,
  };
};

// const formatMessage = (msg: any) => {
//   return {
//     _id: msg._id.toString(),
//     senderId:
//       typeof msg.senderId === "string"
//         ? msg.senderId
//         : {
//             _id: msg.senderId._id.toString(),
//             name: msg.senderId.name,
//             avatar: msg.senderId.avatar,
//           },
//     receiverId: msg.receiverId?.toString(),
//     workspaceId: msg.workspaceId?.toString(),
//     text: msg.text,
//     image: msg.image,
//     file: msg.file,
//     audio: msg.audio,
//     createdAt: msg.createdAt,
//   };
// };

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

    const imageUrl = files?.image?.[0] ? await uploadImage(files.image[0].buffer, "chat/images") : undefined;
    const fileUrl = files?.file?.[0] ? await uploadImage(files.file[0].buffer, "chat/files") : undefined;
    const audioUrl = files?.audio?.[0] ? await uploadImage(files.audio[0].buffer, "chat/audio") : undefined;

    const newMessageDoc = await new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file: fileUrl,
      audio: audioUrl,
    }).save();

    // Populate sender's name and avatar
    const populatedMsg = await newMessageDoc.populate("senderId", "name avatar");

    // Now format for frontend
    const formattedMsg = formatMessage(populatedMsg);


    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId!);

    if (receiverSocketId) io.to(receiverSocketId).emit("receiveMessage", formattedMsg);
    if (senderSocketId) io.to(senderSocketId).emit("receiveMessage", formattedMsg);

    res.status(201).json(formattedMsg);
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

    const imageUrl = files?.image?.[0] ? await uploadImage(files.image[0].buffer, "chat/images") : undefined;
    const fileUrl = files?.file?.[0] ? await uploadImage(files.file[0].buffer, "chat/files") : undefined;
    const audioUrl = files?.audio?.[0] ? await uploadImage(files.audio[0].buffer, "chat/audio") : undefined;

    const newMessage = await new Message({
      senderId,
      workspaceId,
      text,
      image: imageUrl,
      file: fileUrl,
      audio: audioUrl,
    }).save();

    // Populate sender before sending
    const populatedMsg = await newMessage.populate("senderId", "name avatar");

    const formattedMsg = formatMessage(populatedMsg);


    io.emit(`workspace-${workspaceId}`, formattedMsg);
    res.status(201).json(formattedMsg);
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

