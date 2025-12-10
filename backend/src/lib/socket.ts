// import { Server, Socket } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// // Type for mapping user IDs to socket IDs
// const userSocketMap: Record<string, string> = {};

// // Initialize Socket.io
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//   },
// });

// // Function to get socket ID for a given user
// export function getReceiverSocketId(userId: string): string | undefined {
//   return userSocketMap[userId];
// }

// // Handle socket connections
// io.on("connection", (socket: Socket) => {
//   console.log("A user connected", socket.id);

//   const userId = socket.handshake.query.userId as string | undefined;
//   if (userId) userSocketMap[userId] = socket.id;

//   // Emit online users to all clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     if (userId) delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { io, app, server };
