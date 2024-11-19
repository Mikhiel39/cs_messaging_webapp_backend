const { Schema, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  id: { type: Number, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chatID: { type: [String], default: [] },
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Validate password
userSchema.methods.isPasswordValid = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
