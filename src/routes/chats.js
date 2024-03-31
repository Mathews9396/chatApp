const express = require("express");
const router = express.Router();
const auth = require("@middlewares/authMiddleware");
const controller = require("@controllers/chat");

//fetch all the personal chats that user is part of
router.get("/all", auth, controller.fetchAllChats);

//create a new personal chat or retrieve the chat room Id with a user
router.post("/createPC", auth, controller.createPersonalChat);

//create a new group chat
router.post("/createGC", auth, controller.createGroupChat);

//fetch all message in the personal chat
router.get("/:roomId", auth, controller.fetchChatMessages);

router.post("/:roomId/leaveGC", auth, controller.leaveGroupChat);

router.post("/:roomId/addUserToGC", auth, controller.addUserToGC);

module.exports = router;
