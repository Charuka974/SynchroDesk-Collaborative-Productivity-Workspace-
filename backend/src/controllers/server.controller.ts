import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import messageRouter from "../routes/messages";
import { sendMessage } from "../controllers/message.controller";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/chatapp")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  } 
});

// Attach io to request object (optional, if you want to use in controllers)
app.use((req, res, next) => {
  next();
});

// Routes
app.use("/api/messages", messageRouter);

// ---------------------
// Socket.IO logic
// ---------------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a workspace/channel room
  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Send message via socket
  socket.on("send_message", async (data) => {
    try {
      // Persist message in DB
      const message = await sendMessageViaSocket(data);

      // Emit message to all clients in the room (workspace/channel)
      const roomId = message.channelId?.toString() || message.workspaceId?.toString();
      if (roomId) {
        io.to(roomId).emit("receive_message", message);
      }
    } catch (err) {
      console.error("Error sending message via socket:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ---------------------
// Helper function to call your controller logic
// ---------------------
async function sendMessageViaSocket(data: {
  workspaceId?: string;
  channelId?: string;
  receiverId?: string;
  senderId: string;
  content?: string;
  type?: "text" | "image" | "file" | "audio";
}) {
  const { workspaceId, channelId, receiverId, senderId, content, type } = data;

  const message = new (await import("../models/message.model")).Message({
    workspaceId: workspaceId || null,
    channelId: channelId || null,
    senderId,
    receiverId: receiverId || null,
    content,
    type: type || "text",
  });

  await message.save();
  return message.toObject(); // plain object for socket emit
}

// ---------------------
server.listen(3001, () => console.log("Server running on http://localhost:3001"));
