const mongoose = require("mongoose");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const groupChatSchema = new mongoose.Schema(
  {
    chatUniqueId: {
      type: String,
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message", required: false }],
    lastMessageTimestamp: { type: Date, default: Date.now },
    pinned: { type: Boolean, default: false },
    groupChat: { type: Boolean, default: true },
    chatKey: { type: Buffer, required: true },
  },
  {
    timestamps: true,
  }
);

groupChatSchema.statics.generateUniqueUUID = async function () {
  let uniqueUUID = uuidv4();
  const chatExists = await GroupChat.findOne({ where: { chatUniqueId: uniqueUUID } });
  if (!chatExists || !chatExists.length) {
    return uniqueUUID;
  }
  return GroupChat.generateUniqueUUID();
};

groupChatSchema.statics.generateKey = function () {
  return crypto.randomBytes(32);
};

const GroupChat = mongoose.model("GroupChat", groupChatSchema);

module.exports = GroupChat;
