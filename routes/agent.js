const express = require("express");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
let Agent = require("../models/agent");
let Chat = require("../models/chats");
const bcrypt = require("bcrypt");

const router = express.Router();

// Get all agents
router.route("/").get((req, res) => {
  Agent.find()
    .then((agents) => res.json(agents))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Get a single agent by ID
router.route("/:id").get((req, res) => {
  Agent.findOne({ id: req.params.id })
    .then((agent) => res.json(agent))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Agent login
router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent || !(await agent.isPasswordValid(password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: agent.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, agent });
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});

// Create a new agent (if not exists) on login

router.route("/create").post(async (req, res) => {
  const {id,email,password} = req.body;
  // console.log(req.body)
  try {
    //Check if the agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent)
      return res.status(400).json("Error: Agent already exists");
    // console.log(id+" "+email+" "+password);
    if (!id|| !email || !password)
      return res.status(400).json("Error: id, Email and password are required");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new agent
    const newAgent = new Agent({
      id,
      email,
      password: hashedPassword,
      assignedChats: [],
    });

    // Save the agent to the database
    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});


// Self-assign a chat
router.route("/self-assign/:chatId").post(auth, async (req, res) => {
  const { chatId } = req.params;
  const agentId = req.user.id;

  try {
    const chat = await Chat.findOneAndUpdate(
      { id: chatId, assigned: false },
      { assigned: true },
      { new: true }
    );

    if (!chat) {
      return res
        .status(404)
        .json({ error: "Chat not available for assignment" });
    }

    const agent = await Agent.findOneAndUpdate(
      { id: agentId },
      { $push: { assignedChats: chatId } },
      { new: true }
    );

    res.json({ agent, chat });
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});

// Get all assigned chats for an agent
router.route("/:id/chats").get(auth, async (req, res) => {
  const agentId = req.params.id;

  try {
    const agent = await Agent.findOne({ id: agentId });
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const assignedChats = await Chat.find({ id: { $in: agent.assignedChats } });
    res.json(assignedChats);
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});

module.exports = router;
