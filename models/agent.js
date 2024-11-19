const { Schema, default: mongoose } = require("mongoose");

const agentSchema = new Schema({
  id: { type: Number, required: true, unique: true, trim: true },
  assignedChats: { type: [Number], required: true },
});

const Agent = mongoose.model("Agent", agentSchema);
module.exports = Agent;
