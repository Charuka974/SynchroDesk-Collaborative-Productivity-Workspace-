import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import http from "http"
import { Server, Socket } from "socket.io"

import authRouter from "./routes/auth"
import workspaceRouter from "./routes/workspace"
import tasksRouter from "./routes/tasks"
import messageRouter from "./routes/messages"
import openapiAiRouter from "./routes/airoute"
import userRouter from "./routes/users"
import noteRouter from "./routes/notes"
import notificationRouter from "./routes/notification"

import { authenticate } from "./middleware/auth"
import { requireRole } from "./middleware/role"
import { Role } from "./models/user.model"

dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI as string

const app = express()
const server = http.createServer(app);


app.use(express.json())
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] // optional
  })
)

app.use("/api/v1/auth", authRouter)

// protected routes
app.use("/api/v1/workspaces", authenticate, workspaceRouter)
app.use("/api/v1/tasks", authenticate, tasksRouter)
app.use("/api/v1/messages", authenticate, messageRouter)
app.use("/api/v1/aiassistant", authenticate, openapiAiRouter)
app.use("/api/v1/users", authenticate, userRouter)
app.use("/api/v1/notes", authenticate, noteRouter)
app.use("/api/v1/notifications", authenticate, notificationRouter)

 
// public
app.get("/test-1", (req, res) => {})
// admin only
app.get("/test-3", authenticate, requireRole([Role.ADMIN]), (req, res) => {})



mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB connected")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

// app.listen(PORT, () => {
//   console.log("Server is running")
// })









// ---------------------- SOCKET.IO SETUP ----------------------
interface IUserSocketMap {
  [userId: string]: string;
}

const userSocketMap: IUserSocketMap = {};

export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId as string | undefined;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
}); 

// ---------------------------------------------------------------




server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
