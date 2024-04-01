const PersonalChat = require("@models/personalChat");
const GroupChat = require("@models/groupChat");
// const Message = require("@models/message");
const mongoose = require("mongoose");
const { validateUserPartOfRoom, removeValues } = require("@helpers/chatHelper");
const crypto = require("crypto");

const User = require("@models/user");
// const { v4: uuidv4 } = require("uuid");

function decryptMessageContent(params) {
  const decipher = crypto.createDecipheriv(process.env.ENCRYPT_ALGORITHM, params.key, params.iv);
  let decrypted = decipher.update(params.content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

async function createUserIfNotExist(email) {
  let user = await User.findOne({
    email: email,
  });
  if (!user) {
    user = new User({
      name: "Firstname",
      email: email,
      password: "letsEndorse",
      age: 25,
    });
    await user.save();
  }
  return user;
}

const fetchAllChats = async function (req, res) {
  try {
    const personalChats = await PersonalChat.find({ participants: req.user._id })
      .populate("participants", "name") // Populate participants with username only
      .sort({ lastMessageTimestamp: -1 }); // Sort by lastMessageTimestamp in descending order

    const groupChats = await GroupChat.find({ participants: req.user._id })
      .populate("participants", "name") // Populate participants with name only
      .sort({ lastMessageTimestamp: -1 }); // Sort by lastMessageTimestamp in descending order

    return res.status(200).json({ message: `Chats retieved successfully`, personalChats, groupChats });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Error while fetching chats", error: err.message });
  }
};

//based on a given email, a personal chat is created with the user. If chat already exists between the users, then chat data is sent back and an additional boolean value thats say chat alreadys exists
const createPersonalChat = async function (req, res) {
  try {
    if (!req.body.email || req.body.email == req.user.email) {
      return res.status(400).json({ message: "Provide a valid email" });
    }
    const userToAdd = await createUserIfNotExist(req.user.email);
    const participants = [userToAdd._id, req.user._id];

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

const createGroupChat = async function (req, res) {
  try {
    console.log(req.body.emails);
    if (!req.body.emails || req.body.emails.length == 0) {
      return res.status(400).json({ message: "Provide valid emails" });
    }
    const userEmailsToAdd = req.body.emails;
    const participants = [];
    participants.push(req.user._id);
    for (const email of userEmailsToAdd) {
      let user = await createUserIfNotExist(email);
      participants.push(user._id);
    }
    const newGroupChat = new GroupChat({
      chatUniqueId: await GroupChat.generateUniqueUUID(),
      participants,
      chatKey: GroupChat.generateKey(),
    });
    await newGroupChat.save();
    return res.status(200).json({ message: "Group Chat created", newGroupChat });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

const fetchChatMessages = async function (req, res) {
  try {
    const roomId = req.params.roomId;
    if (!roomId) throw new Error("Chat room id needs to be specified");
    const chat = await validateUserPartOfRoom(roomId, req.user._id);
    if (!chat) throw new Error("User not part of chat");

    let chatMessages = await chat.populate({
      path: "messages",
      populate: {
        path: "sender",
        model: "User",
        select: "_id name email",
      },
      options: { sort: { createdAt: 1 } }, // Sorting based on createdAt time
    });

    for (const message of chatMessages.messages) {
      message.content = decryptMessageContent({ content: message.content, key: chat.chatKey, iv: message.messageIV });
    }

    chatMessages = removeValues(chatMessages, ["chatKey"]);

    return res.status(200).json({ message: "chat messages retrieved succesfully ", chatMessages });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

const leaveGroupChat = async function (req, res) {
  try {
    const roomId = req.params.roomId;
    if (!roomId) throw new Error("Chat room id needs to be specified");
    const chat = await validateUserPartOfRoom(roomId, req.user._id);
    if (!chat || !chat.groupChat) throw new Error("Invalid Chat room");

    const newParticipants = [];
    const currentUserIdString = String(req.user._id);
    for (const id of chat.participants) {
      if (String(id) == currentUserIdString) continue;
      newParticipants.push(id);
    }
    chat.participants = newParticipants;

    await chat.save();

    return res.status(200).json({
      message: "you have exited the group chat",
      newParticipantList: chat.participants,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

const addUserToGC = async function (req, res) {
  try {
    if (!req.params.roomId) throw new Error("Chat room id needs to be specified");

    if (!req.body.email || req.body.email == req.user.email) throw new Error("Provide valid email");

    let chat = await validateUserPartOfRoom(req.params.roomId, req.user._id);
    if (!chat) throw new Error(`Chat room doesnt exist`);
    console.log(chat.participants);

    const userToAdd = await createUserIfNotExist(req.body.email);
    chat.participants.push(userToAdd._id);
    console.log(chat.participants);
    return res.status(200).json({ message: "User added to chat!", newParticipantList: chat.participants });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  fetchAllChats,
  createPersonalChat,
  fetchChatMessages,
  createGroupChat,
  leaveGroupChat,
  addUserToGC,
};
