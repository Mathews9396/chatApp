const mongoose = require("mongoose");
const crypto = require("crypto");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messageType: { type: String, enum: ["text", "image", "video", "document"], required: true },
  chat_Id: { type: mongoose.Schema.Types.ObjectId, ref: "chat", required: true },
  content: { type: String, required: true },
  edited: { type: Boolean, default: false },
  messageIV: { type: Buffer, required: true },
});

messageSchema.methods.toJSON = function () {
  const message = this;
  const msgObject = message.toObject();

  delete msgObject.messageIV;

  return msgObject;
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
