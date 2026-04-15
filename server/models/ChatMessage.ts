import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  text: { type: String, required: true }
}, { timestamps: true });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
