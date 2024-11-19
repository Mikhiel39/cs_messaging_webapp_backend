const router = require("express").Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Agent = require("../models/agent");
const Chat = require("../models/chats");
const User = require("../models/users");
const auth = require("../middleware/auth");
const Message = require("../models/message");

const chatsRouter = (io) => {
  // Get all chats
  router.route("/").get(auth, (req, res) => {
    Chat.find()
      .then((chats) => res.json(chats))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Get a specific chat by ID
  router.route("/:id").get(auth, (req, res) => {
    Chat.findOne({ id: req.params.id })
      .then((chat) => res.json(chat))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Assign a chat to an agent
  router.route("/assign/:id").post(auth, (req, res) => {
    const chatId = req.params.id;
    const agentId = req.body.id;

    Chat.findOneAndUpdate(
      { id: chatId, assigned: false },
      { assigned: true },
      { new: true }
    )
      .then((updatedChat) => {
        if (!updatedChat) {
          return res.status(400).json("Chat already assigned or not found.");
        }

        return Agent.findOneAndUpdate(
          { id: agentId },
          { $push: { assignedChats: chatId } },
          { new: true }
        );
      })
      .then(() => res.json("Chat assigned successfully"))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Self-assign an unassigned chat
  router.route("/self-assign/:id").post(auth, (req, res) => {
    const chatId = req.params.id;
    const agentId = req.body.id;

    Chat.findOneAndUpdate(
      { id: chatId, assigned: false },
      { assigned: true },
      { new: true }
    )
      .then((updatedChat) => {
        if (!updatedChat) {
          return res.status(400).json("Chat already assigned or not found.");
        }

        return Agent.findOneAndUpdate(
          { id: agentId },
          { $push: { assignedChats: chatId } },
          { new: true }
        );
      })
      .then(() => res.json("Chat self-assigned successfully"))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Get all messages for a chat
  router.route("/:id/messages").get(auth, (req, res) => {
    Message.find({ chatId: req.params.id })
      .then((messages) => res.json(messages))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Add a new message from an agent
  router.route("/messages/agent").post(auth, async (req, res) => {
    try {
      const { message, chatId } = req.body;

      if (!message) {
        return res.status(400).json("Error: Message content is required.");
      }

      const chatExists = await Chat.findOne({ id: chatId });
      if (!chatExists) {
        return res.status(400).json("Error: Chat not found.");
      }

      const senderId = uuidv4();

      const newMessage = new Message({
        senderType: "agent",
        senderId,
        chatId,
        message,
      });

      await newMessage.save();

      io.to(chatId).emit("new_message", newMessage);

      res.status(201).json({ message: "Message added!", newMessage });
    } catch (err) {
      console.error("Error adding message:", err);
      res.status(500).json("Error: " + err.message);
    }
  });

  // Add a new message from a user
  router.route("/messages/user").post(auth, async (req, res) => {
    try {
      const { message, chatId: providedChatId } = req.body;

      if (!message) {
        return res.status(400).json("Error: Message content is required.");
      }

      let chatId = providedChatId;
      if (!chatId) {
        chatId = uuidv4();
        const newChat = new Chat({
          id: chatId,
          assigned: false,
          isUrgent: false,
        });
        await newChat.save();

        await User.findOneAndUpdate(
          { id: req.body.id },
          { $push: { chatID: chatId } },
          { new: true }
        );
      }

      const senderId = uuidv4();

      const newMessage = new Message({
        senderType: "user",
        senderId,
        chatId,
        message,
      });

      await newMessage.save();

      io.to(chatId).emit("new_message", newMessage);

      res.status(201).json({ message: "Message added!", newMessage });
    } catch (err) {
      console.error("Error adding message:", err);
      res.status(500).json("Error: " + err.message);
    }
  });

  // Create a new user
  router.route("/create").post(auth, async (req, res) => {
    const { id, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json("Error: User already exists");

      if (!id || !email || !password) {
        return res
          .status(400)
          .json("Error: ID, email, and password are required.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        id,
        email,
        password: hashedPassword,
        chatID: [],
      });

      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json("Error: " + err);
    }
  });

  // Search for messages in a chat
  router.route("/search").get(auth, (req, res) => {
    const query = req.query.q || "";

    Message.find({
      message: { $regex: query, $options: "i" },
    })
      .then((messages) => res.json(messages))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Get urgent messages
  router.route("/urgent").get((req, res) => {
    Message.find({ isUrgent: true })
      .then((urgentMessages) => res.json(urgentMessages))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  return router;
};

module.exports = chatsRouter;
