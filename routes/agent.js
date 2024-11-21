const router = require("express").Router();
const Agent = require("../models/Agent");

//add new agent

router.post("/", async (req, res) => {
  const newAgent = new Agent(req.body);

  try {
    const savedAgent = await newAgent.save();
    res.status(200).json(savedAgent);
    console.log("post: Agent/ call success");
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all agents

router.get("/", async (req, res) => {
    try {
        const agents = await Agent.find();
      res.status(200).json(agents);
      console.log("get: Agent/ call success");
    } catch (err) {
      res.status(500).json(err);
    }
  });

  module.exports = router;