const router = require("express").Router();
let Message = require("../models/message");

router.route("/").get((req, res) => {
  Message.find()
    .then((msg) => res.json(msg))
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
