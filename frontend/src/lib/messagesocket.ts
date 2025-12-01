import { io as clientIO, Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = (userId: string) => {
  if (!socket) {
    socket = clientIO("http://localhost:5000", {
      query: { userId },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error("Socket not connected yet");
  return socket;
};
