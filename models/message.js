const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String, required: true,
      ref: "Conversation",
    },
    text: {
      type: String,
    },
    isAgent: {
      type: Boolean, required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
