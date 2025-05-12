import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'audio'], required: true },
  messageContent: { type: String, required: true }, // Text, image URL, or audio URL
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
