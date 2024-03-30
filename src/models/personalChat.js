const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Message = require("./message"); // Import the message schema
const { v4: uuidv4 } = require("uuid");

const personalChatSchema = new mongoose.Schema(
  {
    chatUniqueId: {
      type: String,
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message", required: false }],
    lastMessageTimestamp: { type: Date, default: Date.now },
    pinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

personalChatSchema.statics.generateUniqueUUID = async function () {
  let uniqueUUID = uuidv4();
  const chatExists = await PersonalChat.findOne({ where: { chatUniqueId: uniqueUUID } });
  if (!chatExists || !chatExists.length) {
    return uniqueUUID;
  }
  return PersonalChat.generateUniqueUUID();
};

const PersonalChat = mongoose.model("PersonalChat", personalChatSchema);

module.exports = PersonalChat;
