const mongoose = require("mongoose");
const crypto = require("crypto");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messageType: { type: String, enum: ["text", "image", "video", "document"], required: true },
  chat_Id: { type: mongoose.Schema.Types.ObjectId, ref: "chat", required: true },
  content: { type: String, required: true },
  edited: { type: Boolean, default: false },
  // messageIV: { type: String, required: true },
});

// // Hash the plain text password before saving
// messageSchema.pre("save", async function (next) {
//   const message = this;
//   const cipher = crypto.createCipheriv("aes-256-cbc", key);
//   let encryptedMessage = cipher.update(message.message, "utf8", "hex");
//   encryptedMessage += cipher.final("hex");
//   console.log(encryptMessage);
//   // return encryptedMessage;
//   next();
// });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
