const logger = require("@utils/logger");
// const PersonalChat = require("@models/personalChat");
const { createMessage } = require("./message");
const { validateUserPartOfRoom } = require("@helpers/chatHelper");
// async function validateUserPartOfRoom(roomId, userId) {
//   const chat = await PersonalChat.findOne({ chatUniqueId: roomId });
//   if (!chat) {
//     throw new Error(`Chat room doesnt exist`);
//   }
//   console.log(chat.participants, userId);
//   if (chat.participants.includes(userId)) {
//     return chat;
//   }
//   throw new Error(`User is part of chat`);
// }

const socketConnection = function (socket) {
  console.log("user connected with socket id: ", socket.id);
  const originSocket = socket;

  socket.on("join", async function (joiningData, callback) {
    try {
      logger.warn(`---------------------- joining Room details: ${joiningData.roomId}, socketId: ${socket.id}, ----------------------`);

      // const userRoom = `user-${joiningData.roomId}-${joiningData.userId}`;
      const chat = await validateUserPartOfRoom(joiningData.roomId, joiningData.userId);
      if (!chat) throw new Error("User not part of chat");
      console.log(`chat`, chat);
      socket.data = joiningData;
      socket.data.chat = chat;

      socket.join(joiningData.roomId);
      // socket.join(updatedJoiningData.userRoom);

      if (callback) {
        callback({
          status: "ok",
        });
      }
    } catch (err) {
      console.error(err);
      callback({
        error: err,
      });
    }
  });

  socket.on("chat message", async (params, callback) => {
    try {
      console.log("emiting msg: ", params);

      const retval = await createMessage(params, socket);
      console.log(`\n\nretval - `, retval);
      socket.to(socket.data.roomId).emit("chat message", params); // emiting to socket does not emit to the same room from where it was emitted

      if (callback) {
        callback({
          status: "ok",
        });
      }
    } catch (err) {
      console.error(err);
      if (callback)
        callback({
          error: err,
        });
    }
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected from room id - ", socket.data.roomId);

    logger.warn(`---------------------- user disconnected, socketId: ${originSocket.id} ----------------------`);
  });
};
module.exports = { socketConnection };
