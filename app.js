import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When new user joins
  socket.on("new-user", (name) => {
    socket.username = name;
    onlineUsers.push(name);

    io.emit("user-joined", name);
    io.emit("online-users", onlineUsers);
  });

  // When user sends message
  socket.on("chat-message", (message) => {
    io.emit("chat-message", { message, name: socket.username });
  });

  // When user disconnects
  socket.on("disconnect", () => {
    if (socket.username) {
      onlineUsers = onlineUsers.filter(u => u !== socket.username);
      io.emit("user-left", socket.username);
      io.emit("online-users", onlineUsers);
    }
  });
});

server.listen(3000, () => console.log("Server running at http://localhost:3000"));
