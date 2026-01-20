const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Change to 5173 if using Vite
    methods: ["GET", "POST"],
  },
});

const SECRET_KEY = "your_super_secret_key";

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication Error : Token required"));
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error("Authentication Error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. EVENT: Join a specific room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  // 2. EVENT: Send message to a specific room
  socket.on("send_message", (data) => {
    // 'to(data.room)' sends it only to people in that room
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3003, () => {
  console.log("SERVER RUNNING ON PORT 3003");
});
