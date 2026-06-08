import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
  if (!user) return;

  if (socket && socket.connected) return socket;

  socket = io("http://127.0.0.1:8000", {
    auth: {
      username: user.username,
      role: user.role
    }
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server:", socket.id);
  });

  return socket;
};

export const getSocket = () => socket;
