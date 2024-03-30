const PersonalChat = require("@models/personalChat");

async function validateUserPartOfRoom(roomId, userId) {
  const chat = await PersonalChat.findOne({ chatUniqueId: roomId });
  if (!chat) {
    throw new Error(`Chat room doesnt exist`);
  }
  if (chat.participants.includes(userId)) {
    return chat;
  }
  throw new Error(`User is part of chat`);
}

module.exports = {
  validateUserPartOfRoom,
};
