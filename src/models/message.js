const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messageType: { type: String, enum: ["text", "image", "video", "document"], required: true },
  chat_Id: { type: mongoose.Schema.Types.ObjectId, ref: "chat", required: true },
  content: { type: String, required: true },
  edited: { type: Boolean, default: false },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
