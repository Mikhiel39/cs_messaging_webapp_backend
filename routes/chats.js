const router = require("express").Router();
const Agent = require("../models/agent");
let Chat = require("../models/chats");
const Message = require("../models/message");

const chatsRouter = (io) => {
  router.route("/").get((req, res) => {
    Chat.find()
      .then((users) => res.json(users))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  router.route("/:id").get((req, res) => {
    Chat.findOne({ id: req.params.id })
      .then((user) => res.json(user))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  router.route("/assign/:id").post((req, res) => {
    Chat.findOneAndUpdate(
      { id: req.params.id },
      { assigned: true },
      { returnOriginal: false }
    ).catch((err) => res.status(400).json("Error: " + err));

    Agent.findOne({ id: req.body.id })
      .then((agent) => {
        if (agent.assignedChats.includes(req.params.id))
          return res.json("already assigned");

        const newAssignedChats = [...agent.assignedChats, req.params.id];

        Agent.findOneAndUpdate(
          { id: req.body.id },
          { assignedChats: newAssignedChats },
          { returnOriginal: true }
        )
          .then(() => res.json("assigned"))
          .catch((err) => res.status(400).json("Error: " + err));
      })
      .catch((err) => res.status(400).json("Error: " + err));
  });

  router.route("/:id/messages").get((req, res) => {
    Message.find({ chatId: req.params.id })
      .then((messages) => res.json(messages))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  router.route("/:id/messages").post((req, res) => {
    const senderType = req.body.senderType;
    const senderId = req.body.senderId;
    const chatId = req.params.id;
    const message = req.body.message;

    const newMessage = new Message({
      senderType,
      senderId,
      chatId,
      message,
    });

    newMessage
      .save()
      .then(() => res.json("Message added!"))
      .catch((err) => res.status(400).json("Error: " + err));

    io.emit("new_message", newMessage);
    //io.to(parseInt(chatId)).emit("new_message", newMessage);
  });
  return router;
};
module.exports = chatsRouter;
