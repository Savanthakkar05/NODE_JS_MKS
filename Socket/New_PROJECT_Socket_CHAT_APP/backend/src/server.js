const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Connect User : ${socket.id}`);

  socket.on("send_message", (data) => {
    // console.log(msg);
    io.emit("receive_message", data);
  });
  socket.on("disconnect", () => {
    console.log(`Disconnect User : ${socket.id}`);
  });
});

server.listen(3003, () => {
  console.log("Server run on the 3003");
});
