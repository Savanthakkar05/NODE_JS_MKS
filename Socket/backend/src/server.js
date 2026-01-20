const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const cors = require("cors");
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("user connect", socket.id);

  socket.on("send_message", (data) => {
    // console.log("Message received : ", data);
    const message = { username: socket.id, message: data };
    console.log(message);
    socket.broadcast.emit("receive_message", message);
  });
  socket.on("disconnect", () => {
    console.log("User disconnect : ", socket.id);
  });
});

server.listen(3001, () => {
  console.log(`Server run on the http://localhost:3001`);
});
