const { Schema, default: mongoose } = require("mongoose");

const userSchema = new Schema({
  id: { type: Number, required: true, unique: true, trim: true },
  chatId: { type: Number, required: true },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
