const Message = require("@models/message");
const crypto = require("crypto");
const { removeValues } = require("@helpers/chatHelper");

function encryptMessage(chatKey, content) {
  const key = chatKey;
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(process.env.ENCRYPT_ALGORITHM, key, iv);

  let encrypted = cipher.update(content, "utf8", "hex");
  encrypted += cipher.final("hex");
  return [encrypted, iv];
}

const updateChat = async function (chat, messageId) {
  chat.messages.push(messageId);
  chat.lastMessageTimestamp = Date.now();
  await chat.save();
  return chat;
};

const createMessage = async function (params, socket) {
  const chat = socket.data.chat;

  const [encryptedMessageContent, iv] = encryptMessage(chat.chatKey, params);

  const newMessage = new Message({
    sender: socket.data.userId,
    messageType: "text",
    chat_Id: chat._id,
    content: encryptedMessageContent,
    messageIV: iv,
  });

  await newMessage.save();
  await updateChat(chat, newMessage._id);
  const newMessageObj = removeValues(newMessage, ["messageIV"]);
  return newMessageObj;
};

module.exports = {
  createMessage,
};
