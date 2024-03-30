const Message = require("@models/message");
const mongoose = require("mongoose");

const updateChat = async function (chat, messageId) {
  chat.messages.push(messageId);
  chat.lastMessageTimestamp = Date.now();
  await chat.save();
  return chat;
};

const createMessage = async function (params, socket) {
  const chat = socket.data.chat;
  const newMessage = new Message({
    sender: socket.data.userId,
    messageType: "text",
    chat_Id: chat._id,
    content: params,
  });
  await newMessage.save();
  updateChat(chat, newMessage._id);
  return newMessage;
};

module.exports = {
  createMessage,
};
