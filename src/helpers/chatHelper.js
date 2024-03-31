const PersonalChat = require("@models/personalChat");
const GroupChat = require("@models/groupChat");

async function validateUserPartOfRoom(roomId, userId) {
  let chat = await PersonalChat.findOne({ chatUniqueId: roomId });
  if (!chat) {
    chat = await GroupChat.findOne({ chatUniqueId: roomId });
    if (!chat) throw new Error(`Chat room doesnt exist`);
  }
  if (chat.participants.includes(userId)) {
    return chat;
  }
  throw new Error(`User is not part of chat`);
}

module.exports = {
  validateUserPartOfRoom,
};
