const express = require("express");
const Message = require("../models/message");
const auth = require("../middleware/auth");

const router = express.Router();

// 1. Get All Messages
router.get("/", (req, res) => {
  Message.find()
    .then((messages) => res.json(messages))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 2. Create a New Message
router.post("/", (req, res) => {
  const { senderType, senderId, chatId, message, isUrgent = false } = req.body;

  const newMessage = new Message({
    senderType,
    senderId,
    chatId,
    message,
    isUrgent,
  });

  newMessage
    .save()
    .then(() => res.json("Message added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 3. Mark a Message as Urgent
router.patch("/:id/mark-urgent", auth, (req, res) => {
  Message.findByIdAndUpdate(
    req.params.id,
    { $set: { isUrgent: true } },
    { new: true }
  )
    .then((updatedMessage) => res.json(updatedMessage))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 4. Search Messages
router.get("/search", (req, res) => {
  const { query } = req.query;

  Message.find({ message: { $regex: query, $options: "i" } })
    .then((messages) => res.json(messages))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 5. Get Messages by Chat ID
router.get("/chat/:chatId", (req, res) => {
  Message.find({ chatId: req.params.chatId })
    .then((messages) => res.json(messages))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 6. Get Urgent Messages
router.get("/urgent", (req, res) => {
  Message.find({ isUrgent: true })
    .then((urgentMessages) => res.json(urgentMessages))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 7. Use a Canned Message
router.post("/canned", auth, (req, res) => {
  const { senderType, senderId, chatId, cannedMessageId } = req.body;

  // Assuming a `CannedMessage` model exists
  const CannedMessage = require("../models/cannedMessage");

  CannedMessage.findById(cannedMessageId)
    .then((cannedMessage) => {
      if (!cannedMessage)
        return res.status(404).json("Canned message not found");

      const newMessage = new Message({
        senderType,
        senderId,
        chatId,
        message: cannedMessage.content,
      });

      return newMessage.save();
    })
    .then(() => res.json("Canned message sent!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
