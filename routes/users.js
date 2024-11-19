const router = require("express").Router();
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Fetch all users
router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Fetch a specific user by ID
router.route("/:id").get((req, res) => {
  User.findOne({ id: req.params.id })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
});

// User login with email and password
router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("Error: User not found");

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json("Error: Invalid credentials");

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json("Error: " + err);
  }
});


// Update user details
router.route("/:id").put((req, res) => {
  User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Delete a user by ID
router.route("/:id").delete((req, res) => {
  User.findOneAndDelete({ id: req.params.id })
    .then(() => res.json("User deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
