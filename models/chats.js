const { Schema, default: mongoose } = require("mongoose");

const chatSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true, trim: true },
    assigned: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
