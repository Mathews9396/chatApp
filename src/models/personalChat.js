const mongoose = require("mongoose");
require("dotenv").config();
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
    personalChat: { type: Boolean, default: true },
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
