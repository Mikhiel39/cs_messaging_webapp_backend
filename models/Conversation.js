const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    custId: { type: String, required: true },
    agentId: { type: String, default: "empty"},
    isUrgent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
