const { Schema, default: mongoose } = require("mongoose");

const messageSchema = new Schema(
  {
    senderType: { type: String, enum: ["agent", "user"], required: true },
    senderId: { type: Number, required: true },
    chatId: {
      type: Number,
      required: true,
    },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
