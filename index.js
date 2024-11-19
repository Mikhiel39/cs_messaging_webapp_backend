require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());
mongoose.set("strictQuery", true);

mongoose.connect(process.env.URI, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connected");
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("Server on");
});
const io = require("socket.io")(server, {
  cors: process.env.DEPLOYED_URL || "127.0.0.1",
});

const usersRouter = require("./routes/users");
const chatsRouter = require("./routes/chats")(io);
const agentsRouter = require("./routes/agent");
const messagesRouter = require("./routes/message");

app.use("/users", usersRouter);
app.use("/chats", chatsRouter);
app.use("/agents", agentsRouter);
app.use("/messages", messagesRouter);

io.on("connection", (socket) => {
  console.log("connected socket");

  socket.on("join_chat", async (chatId) => {
    await socket.join(chatId);
    console.log("joined " + chatId);
  });

  socket.on("change_chat", async (chatId) => {
    (await socket.rooms).forEach((room) => {
      socket.leave(room);
    });
    await socket.join(chatId);
    console.log(socket.rooms);
  });
});
