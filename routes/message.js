const router = require("express").Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const {urgentWords} = require("../utils/urgentWords")
//add

router.post("/", async (req, res) => {
  const msgBody = {
    text: req.body.text,
    isAgent: req.body.isAgent,
    conversationId: req.body.conversationId
  }
  const newMessage = new Message(msgBody);

  try {
    var savedMessage = await newMessage.save();

    if(req.body.fm!==undefined){
      if (urgentWords.some(v => req.body.text.includes(v))){
        const updatedConversation = await Conversation.findByIdAndUpdate(
        req.body.conversationId,
        {
          isUrgent: true,
        }
       );
      savedMessage = {...savedMessage._doc, 'isUrgent' : true};
      }else{
              savedMessage = {...savedMessage._doc, 'isUrgent' : false};

      }
      
    }
    res.status(200).json(savedMessage);
    console.log("post: message/ call success");
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
    console.log("get: message/:conversationId call success");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/search/", async (req, res) => {
  try {
    var textSearch = await Message.find({
      "$or":[{text:{$regex: req.body.searchText}}]
    }).populate("conversationId").exec();

    res.status(200).json(textSearch);
    console.log("get: message/search call success");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
