const { Schema, default: mongoose } = require("mongoose");

const cannedMessageSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const CannedMessage = mongoose.model("CannedMessage", cannedMessageSchema);
module.exports = CannedMessage;
