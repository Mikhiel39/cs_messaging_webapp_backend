const { Schema, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const agentSchema = new Schema({
  id: { type: Number, required: true, unique: true, trim: true },
  email: { type: String, required: true},
  password: { type: String, required: true },
  assignedChats: { type: [String], default: [] },
});

// Hash password before saving
agentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Validate password
agentSchema.methods.isPasswordValid = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Agent = mongoose.model("Agent", agentSchema);
module.exports = Agent;
