const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/message");

//new conv

router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    custId: req.body.custId,
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
    console.log("post: conversation/ call success");
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

//get unalloted conv 
router.get("/unalloted", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      agentId: "empty",
    });

    for(let i=0; i<conversations.length; i++){
      const latestMsg = await Message.findOne({
        conversationId: conversations[i]._id,
      }).sort({createdAt: -1});
      conversations[i] = {...conversations[i]._doc, 'latestMsg' : latestMsg? latestMsg:null};
      // console.log(conversations[i]);
    }

    res.status(200).json(conversations);
    console.log("get: conversation/unalloted call success");
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

//get alloted conv of a agent

router.get("/agent/:agentId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      agentId: req.params.agentId,
    });

    for(let i=0; i<conversations.length; i++){
      const latestMsg = await Message.findOne({
        conversationId: conversations[i]._id,
      }).sort({createdAt: -1});
      // console.log(latestMsg.text);
      conversations[i] = {...conversations[i]._doc, 'latestMsg' : latestMsg? latestMsg:null};
      // console.log(conversations[i]);
    }

    res.status(200).json(conversations);
    console.log("get: conversation/:agentId call success");
  } catch (err) {
    res.status(500).json(err);
  }
});

//allot a conv

router.post("/allot", async (req, res) => {
  try {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.body.conversationId,
      {
        agentId: req.body.agentId,
      }
    );
    res.status(200).json(updatedConversation);
    console.log("post: conversation/allot call success");
  } catch (err) {
    res.status(500).json(err);
  }
});

//unallot a conv

router.post("/unallot", async (req, res) => {
  try {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.body.conversationId,
      {
        agentId: "empty",
      }
    );
    res.status(200).json(updatedConversation);
    console.log("post: conversation/ call success");
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all conv of a customer

router.get("/cust/:custId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      custId: req.params.custId,
    });

    for(let i=0; i<conversations.length; i++){
      const latestMsg = await Message.findOne({
        conversationId: conversations[i]._id,
      }).sort({createdAt: -1});
      // console.log(latestMsg.text);
      conversations[i] = {...conversations[i]._doc, 'latestMsg' : latestMsg? latestMsg:null};
      // console.log(conversations[i]);
    }

    res.status(200).json(conversations);
    console.log("get: conversation/:custId call success");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;