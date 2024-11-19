const express = require("express");
const Message = require("../models/message");
const Chat = require("../models/chats");
const auth = require("../middleware/auth");

const router = express.Router();

// 1. Get All Messages
router.get("/", auth, (req, res) => {
  Message.find()
    .then((messages) => res.json(messages))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 2. Create a New Message
router.post("/", auth, (req, res) => {
  const { senderType, senderId, chatId, message, isUrgent = false } = req.body;

  if (!senderType || !senderId || !chatId || !message) {
    return res.status(400).json("Error: All fields are required.");
  }

  const newMessage = new Message({
    senderType,
    senderId,
    chatId,
    message,
    isUrgent,
  });

  newMessage
    .save()
    .then(() => res.status(201).json({ message: "Message added!" }))
    .catch((err) => res.status(400).json("Error: " + err));
});

// 3. Mark a Message as Urgent
router.patch("/:id/mark-urgent", auth, (req, res) => {
  Message.findByIdAndUpdate(
    req.params.id,
    { $set: { isUrgent: true } },
    { new: true }
  )
    .then((updatedMessage) => {
      if (!updatedMessage) {
        return res.status(404).json("Error: Message not found.");
      }
      res.json(updatedMessage);
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// 4. Get Messages by Chat ID
router.get("/chat/:chatId", (req, res) => {
  Message.find({ chatId: req.params.chatId })
    .then((messages) => {
      if (!messages.length) {
        return res.status(404).json("Error: No messages found for this chat.");
      }
      res.json(messages);
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// 5. Use a Canned Message
router.post("/canned", auth, async (req, res) => {
  try {
    const { senderType, senderId, chatId, cannedMessageId } = req.body;

    if (!senderType || !senderId || !chatId || !cannedMessageId) {
      return res.status(400).json("Error: All fields are required.");
    }

    // Assuming a `CannedMessage` model exists
    const CannedMessage = require("../models/cannedMessage");

    const cannedMessage = await CannedMessage.findById(cannedMessageId);
    if (!cannedMessage) {
      return res.status(404).json("Error: Canned message not found.");
    }

    const newMessage = new Message({
      senderType,
      senderId,
      chatId,
      message: cannedMessage.content,
    });

    await newMessage.save();
    res.status(201).json({ message: "Canned message sent!" });
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});

module.exports = router;
