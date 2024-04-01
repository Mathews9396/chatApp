const logger = require("@utils/logger");
// const PersonalChat = require("@models/personalChat");
const { createMessage } = require("./message");
const { validateUserPartOfRoom } = require("@helpers/chatHelper");

const socketConnection = function (socket) {
  console.log("user connected with socket id: ", socket.id);
  const originSocket = socket;

  socket.on("join", async function (joiningData, callback) {
    try {
      logger.warn(`---------------------- joining Room details: ${joiningData.roomId}, socketId: ${socket.id}, ----------------------`);

      // const userRoom = `user-${joiningData.roomId}-${joiningData.userId}`;
      const chat = await validateUserPartOfRoom(joiningData.roomId, joiningData.userId);
      if (!chat) throw new Error("User not part of chat");
      socket.data = joiningData;
      socket.data.chat = chat;

      socket.join(joiningData.roomId);

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
      socket.to(socket.data.roomId).emit("chat message", retval); // emiting to socket does not emit to the same room from where it was emitted

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
