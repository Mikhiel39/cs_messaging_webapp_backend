const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const Agent = require("../models/agent");
const Chat = require("../models/chats");

const router = express.Router();

// Get all agents
router.get("/", auth, async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single agent by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const agent = await Agent.findOne({ id: req.params.id });
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json(agent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Agent login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent || !(await bcrypt.compare(password, agent.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: agent.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new agent
router.post("/create", auth, async (req, res) => {
  const { id, email, password } = req.body;

  try {
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ error: "Agent already exists" });
    }

    if (!id || !email || !password) {
      return res
        .status(400)
        .json({ error: "ID, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Agent({
      id,
      email,
      password: hashedPassword,
      assignedChats: [],
    });

    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all assigned chats for an agent
router.get("/:id/chats", auth, async (req, res) => {
  const agentId = req.params.id;

  try {
    const agent = await Agent.findOne({ id: agentId });
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const assignedChats = await Chat.find({ id: { $in: agent.assignedChats } });
    res.json(assignedChats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
