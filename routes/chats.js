const router = require("express").Router();
const Agent = require("../models/agent");
const Chat = require("../models/chats");
const Message = require("../models/message");

const chatsRouter = (io) => {
  // Get all chats
  router.route("/").get((req, res) => {
    Chat.find()
      .then((chats) => res.json(chats))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Get a specific chat by ID
  router.route("/:id").get((req, res) => {
    Chat.findOne({ id: req.params.id })
      .then((chat) => res.json(chat))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Assign a chat to an agent
  router.route("/assign/:id").post((req, res) => {
    const chatId = req.params.id;
    const agentId = req.body.id;

    Chat.findOneAndUpdate(
      { id: chatId, assigned: false },
      { assigned: true },
      { returnOriginal: false }
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
  router.route("/self-assign/:id").post((req, res) => {
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
  router.route("/:id/messages").get((req, res) => {
    Message.find({ chatId: req.params.id })
      .then((messages) => res.json(messages))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  const { v4: uuidv4 } = require("uuid"); // For generating unique IDs

  router.route("/messages/agent").post(async (req, res) => {
    try {
      const { message, chatId: providedChatId } = req.body;

      if (!message) {
        return res.status(400).json("Error: Message content is required.");
      }

      // Validate or generate a unique `chatId`
      let chatId = providedChatId;
      if (!chatId) {
        chatId = uuidv4(); // Generate a unique ID for the chat if not provided
      }

      // Check if the chat exists
      const chatExists = await Chat.findOne({ id: chatId });
      if (!chatExists) {
        return res.status(400).json("Error: Message not found.");
      }

      // Create a unique `senderId`
      const senderId = uuidv4(); // Generate a unique ID for the sender

      // Create a new message
      const newMessage = new Message({
        senderType: "agent",
        senderId,
        chatId,
        message,
      });

      // Save the message to the database
      await newMessage.save();

      // Emit the new message to all connected clients
      io.to(chatId).emit("new_message", newMessage);

      res.status(201).json({ message: "Message added!", newMessage });
    } catch (err) {
      console.error("Error adding message:", err);
      res.status(500).json("Error: " + err.message);
    }
  });

  router.route("/messages/user").post(async (req, res) => {
    try {
      const { message, chatId: providedChatId } = req.body;

      if (!message) {
        return res.status(400).json("Error: Message content is required.");
      }

      // Validate or generate a unique `chatId`
      let chatId = providedChatId;
      if (!chatId) {
        chatId = uuidv4(); // Generate a unique ID for the chat if not provided
      }

      // Check if the chat exists
      const chatExists = await Chat.findOne({ id: chatId });
      if (!chatExists) {
        const newChat = new Chat({ id: chatId, assigned: false });
        await newChat.save();
      }

      // Create a unique `senderId`
      const senderId = uuidv4(); // Generate a unique ID for the sender

      // Create a new message
      const newMessage = new Message({
        senderType: "user",
        senderId,
        chatId,
        message,
      });

      // Save the message to the database
      await newMessage.save();

      // Emit the new message to all connected clients
      io.to(chatId).emit("new_message", newMessage);

      res.status(201).json({ message: "Message added!", newMessage });
    } catch (err) {
      console.error("Error adding message:", err);
      res.status(500).json("Error: " + err.message);
    }
  });

  router.route("/create").post(async (req, res) => {
    const { id, email, password } = req.body;
    // console.log(req.body);
    try {
      //Check if the agent already exists
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json("Error: Agent already exists");
      // console.log(id+" "+email+" "+password);
      if (!id || !email || !password)
        return res
          .status(400)
          .json("Error: id, Email and password are required");

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new agent
      const newUser = new User({
        id,
        email,
        password: hashedPassword,
        chatID: [],
      });

      // Save the agent to the database
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json("Error: " + err);
    }
  });



  // Search for messages in a chat
  router.route("/search").get((req, res) => {
    const query = req.query.q || "";

    Message.find({
      message: { $regex: query, $options: "i" },
    })
      .then((messages) => res.json(messages))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  // Get urgent messages for a chat
  router.route("/urgent").get((req, res) => {
    Message.find({ isUrgent: true })
      .then((urgentMessages) => res.json(urgentMessages))
      .catch((err) => res.status(400).json("Error: " + err));
  });

  return router;
};

module.exports = chatsRouter;
