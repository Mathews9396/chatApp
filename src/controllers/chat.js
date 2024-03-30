const PersonalChat = require("@models/personalChat");
const Message = require("@models/message");
const mongoose = require("mongoose");
const { validateUserPartOfRoom } = require("@helpers/chatHelper");

const User = require("@models/user");
const { v4: uuidv4 } = require("uuid");

const fetchAllChats = async function (req, res) {
  try {
    console.log(`user id - ${req.user._id}`);
    const chats = await PersonalChat.find({ participants: req.user._id })
      .populate("participants", "username") // Populate participants with username only
      .sort({ lastMessageTimestamp: -1 }); // Sort by lastMessageTimestamp in descending order
    console.log("Chats:", chats);
    return res.status(200).json({ message: `Chats retieved successfully` });

    // Do something with the fetched chats
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

//based on a given email, a personal chat is created with the user. If chat already exists between the users, then chat data is sent back and an additional boolean value thats say chat alreadys exists
const createPersonalChat = async function (req, res) {
  try {
    if (!req.body.email || req.body.email == req.user.email) {
      return res.status(400).json({ message: "Provide a valid email" });
    }
    let userExists = await User.findOne({
      email: req.body.email,
    });
    if (!userExists) {
      userExists = new User({
        name: "Firstname",
        email: req.body.email,
        password: "letsEnforse",
        age: 25,
      });
      await userExists.save();
    }

    const participants = [userExists._id, req.user._id];

    let chatExists = await PersonalChat.findOne({
      participants: { $elemMatch: { $in: participants }, $size: 2 },
    });
    if (chatExists) {
      return res.status(200).json({ message: "Chat Exists", chatExists });
    }

    const newChat = new PersonalChat({
      chatUniqueId: await PersonalChat.generateUniqueUUID(),
      participants,
    });
    await newChat.save();
    return res.status(200).json({ message: "Chat created", newChat });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

const fetchChatMessages = async function (req, res) {
  try {
    const roomId = req.params.roomId;
    if (!roomId) throw new Error("Chat room id needs to be specified");
    console.log(roomId);
    const chat = await validateUserPartOfRoom(roomId, req.user._id);
    if (!chat) throw new Error("User not part of chat");
    console.log(`User is part of chat, Fetching the messages in chat`);
    const chatMessages = await chat.populate({
      path: "messages",
      populate: {
        path: "sender",
        model: "User",
      },
      options: { sort: { createdAt: 1 } }, // Sorting based on createdAt time
    });
    return res.status(200).json({ message: "chat messages retrieved succesfully ", chatMessages });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  fetchAllChats,
  createPersonalChat,
  fetchChatMessages,
};
