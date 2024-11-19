const router = require("express").Router();
const Chat = require("../models/chats");
let User = require("../models/users");

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").get((req, res) => {
  User.findOne({ id: req.params.id })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/login/:id").post((req, res) => {
  User.findOne({ id: req.params.id })
    .then((user) => {
      if (user) return res.send(user);

      const id = req.params.id;
      const newChat = new Chat({ id, assigned: false });
      newChat
        .save()
        .then((chat) => {
          const newUser = new User({
            id: req.params.id,
            chatId: chat.id,
          });

          newUser
            .save()
            .then((user) => {
              res.json(user);
            })
            .catch((err) => res.status(400).json("Error: " + err));
        })
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
