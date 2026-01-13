const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(
  cors({
    origin: "https://messaging-app-umber.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const chatRouter = require("./routes/chatRouter");

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/chat", chatRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("message", ({ roomId, msg, userId }) => {
    socket.to(roomId).emit("message", {
      msg,
      from: userId,
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(3000, (err) => {
  if (err) throw err;
  console.log("App + Socket.IO is listening in port 3000");
});
