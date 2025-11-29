import { io } from "socket.io-client";


const socket = io("http://localhost:3001");

// Connection success
socket.on("connect", () => {
  console.log("🟢 Connected to Socket.IO server:", socket.id);
});

// Connection error
socket.on("connect_error", (err) => {
  console.error("🔴 Socket connection error:", err.message);
});

// Disconnected
socket.on("disconnect", () => {
  console.log("🟡 Disconnected from Socket.IO server");
});


export default socket;
