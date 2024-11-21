const mongoose = require("mongoose");

const { Schema } = mongoose;

const agentSchema = new Schema(
  {
    agentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);