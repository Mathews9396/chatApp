const Message = require("@models/message");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Function to encrypt a message using AES
// function encryptMessage(message, key) {
//   const iv = crypto.randomBytes(16); // Generate initialization vector
//   const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//   let encryptedMessage = cipher.update(message, "utf8", "hex");
//   encryptedMessage += cipher.final("hex");
//   return { encryptedMessage, iv };
// }

const updateChat = async function (chat, messageId) {
  chat.messages.push(messageId);
  chat.lastMessageTimestamp = Date.now();
  await chat.save();
  return chat;
};

const createMessage = async function (params, socket) {
  const chat = socket.data.chat;

  // const { encryptedMessage, iv } = encryptMessage(params, chat.chatKey);

  const newMessage = new Message({
    sender: socket.data.userId,
    messageType: "text",
    chat_Id: chat._id,
    content: params,
    // messageIV: iv,
  });

  await newMessage.save();
  updateChat(chat, newMessage._id);
  return newMessage;
};

module.exports = {
  createMessage,
};
